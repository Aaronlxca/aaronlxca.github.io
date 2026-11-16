const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const evidence = process.env.QA_OUTPUT_DIR ? path.resolve(process.env.QA_OUTPUT_DIR) : path.resolve(__dirname, '../test-results/evidence');
const ids = ['home', 'about', 'experience', 'projects', 'resources', 'contact'];
const settle = page => page.waitForTimeout(1100);

async function navigate(page, id) {
  const toggle = page.locator('#menu-toggle');
  if (await toggle.isVisible() && await toggle.getAttribute('aria-expanded') !== 'true') {
    await toggle.focus();
    await page.keyboard.press('Enter');
  }
  const link = page.locator(`#nav a[href="#${id}"]`);
  await expect(link).toBeVisible();
  await link.focus();
  await page.keyboard.press('Enter');
  await settle(page);
}

async function focusedHeading(page,id) {
  const heading=page.locator(`#${id} h1,#${id} h2`).first();
  await expect(heading).toBeFocused();
  const bounds=await heading.boundingBox();
  const header=await page.locator('.top').boundingBox();
  expect(bounds.y-10,`${id} focus ring clears header`).toBeGreaterThanOrEqual(header.y+header.height-.5);
  expect(bounds.y+bounds.height+10,`${id} heading is fully in view`).toBeLessThanOrEqual(page.viewportSize().height+.5);
}

async function measurements(page, id) {
  return page.locator(`#${id}`).evaluate(section => {
    const box = e => {
      const r = e.getBoundingClientRect();
      return { top:r.top, bottom:r.bottom, left:r.left, right:r.right, height:r.height };
    };
    const content = section.querySelector('.wrap');
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
    let node, textBottom = -Infinity;
    while ((node = walker.nextNode())) {
      if (!node.textContent.trim()) continue;
      const closed = node.parentElement.closest('details:not([open])');
      if (closed && !closed.querySelector('summary').contains(node)) continue;
      if (!node.parentElement.checkVisibility()) continue;
      const range = document.createRange(); range.selectNodeContents(node);
      for (const r of range.getClientRects()) if (r.width && r.height) textBottom = Math.max(textBottom, r.bottom);
    }
    const rgb = color => color.match(/[\d.]+/g).slice(0,3).map(Number);
    const lum = color => rgb(color).map(v => {
      const s=v/255; return s<=.04045 ? s/12.92 : ((s+.055)/1.055)**2.4;
    }).reduce((total,v,i)=>total+v*[.2126,.7152,.0722][i],0);
    let background = getComputedStyle(section).backgroundColor;
    // The hero has an opaque navy gradient with a green wash. Use its lightest
    // endpoint as a conservative contrast bound rather than treating it as transparent.
    if (section.id==='home') background='rgb(32, 71, 63)';
    const labels = [...section.querySelectorAll('.eyebrow,.chapter-footer')].map(e => {
      const s=getComputedStyle(e), a=lum(s.color), b=lum(background);
      let opacity=1;
      for(let p=e;p&&p!==section.parentElement;p=p.parentElement) opacity*=Number(getComputedStyle(p).opacity);
      return { text:e.textContent.trim(), color:s.color, background, opacity,
        ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05) };
    });
    return {id:section.id, content:box(content), tools:box(section.querySelector('.chapter-tools')),
      textBottom, labels, viewportWidth:innerWidth, documentWidth:document.documentElement.scrollWidth,
      chapter:box(section), scrollHeight:section.scrollHeight, clientHeight:section.clientHeight};
  });
}

test('A01–A04: all chapters keep keyboard focus, separate footers, and AA labels', async ({ page }, info) => {
  fs.mkdirSync(path.join(evidence,'screenshots'),{recursive:true});
  await page.goto('/'); await settle(page);
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip')).toBeFocused();
  await page.keyboard.press('Enter'); await settle(page);
  await expect(page.locator('#home h1')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#home .ctas a').first()).toBeFocused();
  const results=[];
  for(const id of ids){
    await navigate(page,id);
    await focusedHeading(page,id);
    const m=await measurements(page,id); results.push(m);
    expect(m.tools.top,`${id} controls below content`).toBeGreaterThanOrEqual(m.content.bottom-.5);
    expect(m.tools.top,`${id} controls below visible text`).toBeGreaterThanOrEqual(m.textBottom-.5);
    expect(m.documentWidth).toBeLessThanOrEqual(m.viewportWidth);
    for(const label of m.labels){
      expect(label.opacity).toBe(1);
      expect(label.ratio,`${id}: ${label.text}`).toBeGreaterThanOrEqual(4.5);
    }
    if(id==='projects'){
      for(const summary of await page.locator('#projects summary').all()) await summary.click();
      const expanded=await measurements(page,id);results.push({...expanded,state:'all disclosures expanded'});
      expect(expanded.tools.top).toBeGreaterThanOrEqual(expanded.textBottom-.5);
      await page.screenshot({path:path.join(evidence,'screenshots',`${info.project.name}-a04-all-projects-expanded.png`)});
      for(const summary of await page.locator('#projects summary').all()) await summary.click();
    }
  }
  await navigate(page,'home');
  for(const id of ids.slice(1)){
    await page.locator('.chapter.is-active .chapter-next').focus();
    await page.keyboard.press('Enter');await settle(page);
    await expect(page.locator(`#${id} h2`)).toBeFocused();
  }
  await page.goBack();await settle(page);
  await focusedHeading(page,'resources');
  await page.goto('/');await settle(page);
  await navigate(page,'projects');await page.goBack();await settle(page);
  await expect(page.locator('#home h1')).toBeFocused();
  await navigate(page,'about');
  if(info.project.name==='desktop'){
    await page.locator('#about').evaluate(e=>{e.scrollTop=e.scrollHeight;});
    await navigate(page,'about');
    expect(await page.locator('#about').evaluate(e=>e.scrollTop)).toBe(0);
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await settle(page);
  await page.keyboard.press('Tab');await page.keyboard.press('Enter');await settle(page);
  await expect(page.locator('#home h1')).toBeFocused();
  await navigate(page,'about');
  await expect(page.locator('#about h2')).toBeFocused();
  await expect(page.locator('html')).not.toHaveClass(/cascade-enabled/);
  fs.writeFileSync(path.join(evidence,`${info.project.name}-a01-a04.json`),JSON.stringify(results,null,2));
});

test('A02: footers clear content at narrow and short breakpoints',async({page},info)=>{
  test.skip(info.project.name!=='desktop','Breakpoint matrix runs once');
  const results=[];
  for(const size of [{width:1280,height:720},{width:1024,height:768},{width:821,height:900},{width:820,height:900},{width:320,height:568}]){
    await page.setViewportSize(size);await page.goto('/');await settle(page);
    for(const id of ids){
      await navigate(page,id);
      const m=await measurements(page,id);results.push({...m,viewport:size});
      expect(m.tools.top,`${id}, ${size.width}px`).toBeGreaterThanOrEqual(Math.max(m.content.bottom,m.textBottom)-.5);
      expect(m.documentWidth).toBeLessThanOrEqual(m.viewportWidth);
      const header=await page.locator('.top').boundingBox();
      expect(m.content.top,`${id} content clears header at ${size.width}px`).toBeGreaterThanOrEqual(header.y+header.height);
    }
  }
  fs.writeFileSync(path.join(evidence,'breakpoint-footer-matrix.json'),JSON.stringify(results,null,2));
});
