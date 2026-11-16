const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('node:fs');
const path = require('node:path');
const evidence = path.resolve(__dirname, '../audit');
const ids = ['home', 'about', 'experience', 'projects', 'resources', 'contact'];
fs.mkdirSync(path.join(evidence, 'screenshots'), { recursive: true });

async function settle(page) { await page.waitForTimeout(1100); }
async function chapter(page, id) {
  // Inspect the rendered control before interacting, including the mobile menu.
  if (await page.locator('#menu-toggle').isVisible()) {
    if (await page.locator('#menu-toggle').getAttribute('aria-expanded') !== 'true') {
      await page.locator('#menu-toggle').click();
    }
  }
  await expect(page.locator(`#nav a[href="#${id}"]`)).toBeVisible();
  await page.locator(`#nav a[href="#${id}"]`).click();
  await settle(page);
}
async function geometry(page) {
  return page.evaluate(() => ({
    viewport: { width: innerWidth, height: innerHeight },
    classes: document.documentElement.className,
    documentWidth: document.documentElement.scrollWidth,
    focused: document.activeElement.outerHTML.slice(0, 300),
    chapters: [...document.querySelectorAll('.chapter')].map(c => {
      const r = c.getBoundingClientRect();
      const w = c.querySelector('.wrap').getBoundingClientRect();
      const f = c.querySelector('.chapter-footer').getBoundingClientRect();
      return { id: c.id, top: r.top, bottom: r.bottom, height: r.height,
        scrollHeight: c.scrollHeight, clientHeight: c.clientHeight, scrollTop: c.scrollTop,
        contentTop: w.top, contentBottom: w.bottom, footerTop: f.top, footerBottom: f.bottom,
        inert: c.inert, visible: c.classList.contains('is-visible') };
    }),
    type: [...document.querySelectorAll('.is-active h1,.is-active h2,.is-active .lead')].map(e => {
      const s = getComputedStyle(e);
      return { text: e.textContent.slice(0, 70), font: s.fontFamily, size: s.fontSize,
        weight: s.fontWeight, lineHeight: s.lineHeight, color: s.color };
    })
  }));
}
test('six chapters: navigation, screenshots, geometry, accessibility and disclosures', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await settle(page);
  await expect(page.locator('main > section')).toHaveCount(6);
  const results = [];
  for (const [index, id] of ids.entries()) {
    await chapter(page, id);
    await expect(page.locator(`#${id}`)).toHaveClass(/is-active/);
    const name = `${info.project.name}-${String(index + 1).padStart(2, '0')}-${id}`;
    await page.screenshot({ path: path.join(evidence, `screenshots/${name}.png`) });
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    results.push({ id, geometry: await geometry(page), violations: axe.violations.map(v => ({
      id: v.id, impact: v.impact, description: v.description,
      nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary }))
    })) });
    if (info.project.name !== 'desktop') {
      await page.locator(`#${id}`).screenshot({ path: path.join(evidence, `screenshots/${name}-complete.png`) });
    } else {
      const overflow = await page.locator(`#${id}`).evaluate(e => e.scrollHeight - e.clientHeight);
      if (overflow > 3) {
        await page.locator(`#${id}`).evaluate(e => { e.scrollTop = e.scrollHeight; });
        await page.screenshot({ path: path.join(evidence, `screenshots/${name}-bottom.png`) });
      }
    }
  }
  await chapter(page, 'projects');
  const summary = page.locator('#projects summary').first();
  await summary.click();
  await expect(page.locator('#projects details').first()).toHaveAttribute('open', '');
  await page.screenshot({ path: path.join(evidence, `screenshots/${info.project.name}-projects-expanded.png`) });
  await summary.click();
  await expect(page.locator('#projects details').first()).not.toHaveAttribute('open', '');
  await chapter(page, 'home');
  await page.locator('#home .ctas a[href="#projects"]').click();
  await settle(page);
  await expect(page.locator('#projects')).toHaveClass(/is-active/);
  await chapter(page, 'resources');
  await expect(page.locator('#resources a.resource')).toHaveCount(2);
  await expect(page.locator('#resources .soon a')).toHaveCount(0);
  await chapter(page, 'contact');
  await page.locator('#contact a[href="resume.html"]').click();
  await expect(page).toHaveURL(/resume\.html$/);
  await expect(page.locator('h1')).toBeVisible();
  expect(errors).toEqual([]);
  fs.writeFileSync(path.join(evidence, `${info.project.name}-results.json`), JSON.stringify({ errors, results }, null, 2));
});

test('desktop cascade, keyboard, history, reduced motion and breakpoint probes', async ({ page, context }, info) => {
  test.skip(info.project.name !== 'desktop', 'Cross-mode probes run once');
  await page.goto('/'); await settle(page);
  const probes = {};
  probes.initial = await geometry(page);
  await page.mouse.wheel(0, 100); await page.waitForTimeout(320);
  await page.screenshot({ path: path.join(evidence, 'screenshots/desktop-transition-home-about.png') });
  await settle(page);
  probes.wheel = await geometry(page);
  await expect(page.locator('#about')).toHaveClass(/is-active/);
  await chapter(page, 'home');
  await page.keyboard.press('Tab');
  probes.focusAfterNavigationAndTab = await geometry(page);
  await page.goto('/'); await settle(page);
  await page.keyboard.press('Tab');
  await page.screenshot({ path: path.join(evidence, 'screenshots/desktop-skip-focus.png') });
  await page.keyboard.press('Enter'); await settle(page);
  await page.keyboard.press('Tab');
  probes.skipThenTab = await geometry(page);
  await page.goto('/'); await settle(page);
  await page.keyboard.press('PageDown'); await settle(page);
  probes.pageDown = await geometry(page);
  await chapter(page, 'projects'); await chapter(page, 'contact');
  await page.goBack(); await settle(page);
  probes.history = await geometry(page);
  await expect(page.locator('#projects')).toHaveClass(/is-active/);
  await page.emulateMedia({ reducedMotion: 'reduce' }); await settle(page);
  probes.reduced = await geometry(page);
  expect(probes.reduced.classes).not.toContain('cascade-enabled');
  await chapter(page, 'home');
  const before = await page.evaluate(() => scrollY);
  await page.locator('#home .ctas a[href="#projects"]').click();
  await page.waitForTimeout(100);
  probes.reducedAfter100ms = { before, scrollY: await page.evaluate(() => scrollY), target: await page.locator('#projects').evaluate(e => e.offsetTop) };
  await settle(page);
  await page.screenshot({ path: path.join(evidence, 'screenshots/desktop-reduced-motion-projects.png') });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  probes.sizes = [];
  for (const size of [{width:1280,height:720},{width:1024,height:768},{width:821,height:900},{width:820,height:900},{width:320,height:568}]) {
    await page.setViewportSize(size); await page.goto('/#about'); await settle(page);
    probes.sizes.push(await geometry(page));
    await page.screenshot({ path: path.join(evidence, `screenshots/probe-${size.width}x${size.height}-about.png`) });
  }
  await page.setViewportSize({width:720,height:450}); await page.goto('/#contact'); await settle(page);
  probes.zoomEquivalent200 = await geometry(page);
  await page.screenshot({ path: path.join(evidence, 'screenshots/probe-200-percent-equivalent-contact.png') });
  const touch = await context.browser().newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const tp = await touch.newPage(); await tp.goto(info.config.projects[0].use.baseURL + '/'); await settle(tp);
  const session = await touch.newCDPSession(tp);
  await session.send('Input.synthesizeScrollGesture', { x:195,y:600,yDistance:-600,speed:600,gestureSourceType:'touch' }); await settle(tp);
  probes.touchSwipe = await geometry(tp);
  await tp.screenshot({path:path.join(evidence,'screenshots/mobile-synthesized-swipe.png')});
  await touch.close();
  fs.writeFileSync(path.join(evidence, 'interaction-probes.json'), JSON.stringify(probes,null,2));
});

test('targeted audit diagnostics', async ({ page, context }, info) => {
  test.skip(info.project.name !== 'desktop', 'Diagnostics run once');
  const results = {};
  await page.goto('/#about'); await settle(page);
  results.about = await geometry(page);
  results.footerAxe = (await new AxeBuilder({page}).include('#about > .chapter-footer').analyze()).violations;
  await chapter(page,'home');
  await page.locator('#home .chapter-next').click(); await settle(page);
  results.nextFocus = await geometry(page);
  await page.keyboard.press('Tab');
  results.nextThenTab = await geometry(page);
  await page.screenshot({path:path.join(evidence,'screenshots/desktop-next-then-tab.png')});
  await page.goto('/'); await settle(page);
  await page.locator('#nav a[href="#projects"]').focus();
  await page.keyboard.press('Enter'); await settle(page);
  await page.keyboard.press('Tab');
  results.headerLinkThenTab = await geometry(page);
  await page.setViewportSize({width:390,height:844}); await page.goto('/'); await settle(page);
  results.targets = await page.locator('#home .chapter-next,#menu-toggle').evaluateAll(es=>es.map(e=>({
    label:e.textContent, width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,font:getComputedStyle(e).fontSize
  })));
  await page.locator('#menu-toggle').click();
  await page.locator('#nav a[href="#about"]').focus();
  await page.screenshot({path:path.join(evidence,'screenshots/mobile-menu-keyboard.png')});
  await page.keyboard.press('Escape');
  results.escapeFocus = await geometry(page);
  const swipe = await context.newCDPSession(page);
  // Native input events: the high-level synthetic gesture probe may be a no-op.
  await swipe.send('Emulation.setTouchEmulationEnabled', {enabled:true});
  await swipe.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[{x:195,y:700}]});
  for(let y=675;y>=200;y-=25){
    await swipe.send('Input.dispatchTouchEvent', {type:'touchMove',touchPoints:[{x:195,y}]});
    await page.waitForTimeout(20);
  }
  await swipe.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
  await settle(page);
  results.nativeTouchSwipe=await geometry(page);
  await page.screenshot({path:path.join(evidence,'screenshots/mobile-dispatched-touch-swipe.png')});
  const tc=await context.browser().newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});
  const t=await tc.newPage(); await t.goto(info.project.use.baseURL+'/#about'); await settle(t);
  results.landscapeTablet=await geometry(t);
  await t.screenshot({path:path.join(evidence,'screenshots/tablet-landscape-about.png')});
  await tc.close();
  const nc=await context.browser().newContext({viewport:{width:390,height:844},javaScriptEnabled:false});
  const n=await nc.newPage(); await n.goto(info.project.use.baseURL+'/');
  results.noJS={menuDisplay:await n.locator('#nav').evaluate(e=>getComputedStyle(e).display),chapterCount:await n.locator('.chapter').count()};
  await n.screenshot({path:path.join(evidence,'screenshots/mobile-no-javascript.png')});
  await nc.close();
  fs.writeFileSync(path.join(evidence,'targeted-diagnostics.json'),JSON.stringify(results,null,2));
});
