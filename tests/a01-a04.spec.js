const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const { chapterLink } = require('./portfolio-controls');
const path = require('node:path');
const evidence = process.env.QA_OUTPUT_DIR ? path.resolve(process.env.QA_OUTPUT_DIR) : path.resolve(__dirname, '../test-results/evidence');
const ids = ['home', 'about', 'experience', 'projects', 'resources', 'contact'];
const settle = page => page.waitForTimeout(1100);

async function navigate(page, id) {
  const link = await chapterLink(page, id, { keyboard: true });
  await expect(link).toBeVisible();
  await link.focus();
  await page.keyboard.press('Enter');
  await settle(page);
}

async function focusedHeading(page,id) {
  const heading=page.locator(`#${id} h1,#${id} h2`).first();
  await expect(heading).toBeFocused();
  const bounds=await heading.boundingBox();
  const header=await page.locator('.site-header').boundingBox();
  expect(bounds.y-10,`${id} focus ring clears header`).toBeGreaterThanOrEqual(header.y+header.height-.5);
  expect(bounds.y+bounds.height+10,`${id} heading is fully in view`).toBeLessThanOrEqual(page.viewportSize().height+.5);
}

async function measurements(page, id) {
  return page.locator(`#${id}`).evaluate(section => {
    const box = e => {
      const r = e.getBoundingClientRect();
      return { top:r.top, bottom:r.bottom, left:r.left, right:r.right, height:r.height };
    };
    const content = section.querySelector('.reading, .chapter-content');
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
    return {id:section.id, content:box(content), tools:box(section.querySelector('.chapter-footer, .section-footer')),
      textBottom, viewportWidth:innerWidth, documentWidth:document.documentElement.scrollWidth,
      chapter:box(section), scrollHeight:section.scrollHeight, clientHeight:section.clientHeight};
  });
}

async function measureLabelContrast(page, id) {
  const selector = '#' + id + ' :is(.chapter-label, .section-footer > span)';
  const label = page.locator(selector).first();
  await label.scrollIntoViewIfNeeded();
  const { color, box, opacity } = await label.evaluate(element => {
    const range = document.createRange();
    range.selectNodeContents(element);
    let opacity = 1;
    for (let node = element; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
    return { color: getComputedStyle(element).color, box: range.getBoundingClientRect().toJSON(), opacity };
  });
  expect(box.top).toBeGreaterThanOrEqual(0);
  expect(box.bottom).toBeLessThanOrEqual(page.viewportSize().height);
  const background = await page.screenshot({
    animations: 'disabled',
    scale: 'css',
    style: selector + ', #' + id + ' .section-footer #year { color: transparent !important; transition: none !important; }',
  });
  const ratio = await page.evaluate(async ({ image, box, color }) => {
    const decoded = new Image();
    decoded.src = 'data:image/png;base64,' + image;
    await decoded.decode();
    const canvas = document.createElement('canvas');
    canvas.width = decoded.width;
    canvas.height = decoded.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(decoded, 0, 0);
    const left = Math.floor(box.left);
    const top = Math.floor(box.top);
    const pixels = ctx.getImageData(left, top, Math.ceil(box.right) - left, Math.ceil(box.bottom) - top).data;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const fg = ctx.getImageData(0, 0, 1, 1).data;
    const luminance = (r, g, b) => [r, g, b].reduce((total, channel, index) => {
      const normalized = channel / 255;
      const linear = normalized <= .04045 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
      return total + linear * [.2126, .7152, .0722][index];
    }, 0);
    const foreground = luminance(...fg);
    let minimum = Infinity;
    for (let i = 0; i < pixels.length; i += 4) {
      const ground = luminance(pixels[i], pixels[i + 1], pixels[i + 2]);
      minimum = Math.min(minimum, (Math.max(foreground, ground) + .05) / (Math.min(foreground, ground) + .05));
    }
    return minimum;
  }, { image: background.toString('base64'), box, color });
  return { color, opacity, ratio };
}

test('A01–A04: all chapters keep keyboard focus, separate footers, and AA labels', async ({ page }, info) => {
  fs.mkdirSync(path.join(evidence,'screenshots'),{recursive:true});
  await page.goto('/'); await settle(page);
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip')).toBeFocused();
  await page.keyboard.press('Enter'); await settle(page);
  await expect(page.locator('#home h1')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#home .actions a').first()).toBeFocused();
  const results=[];
  for(const id of ids){
    await navigate(page,id);
    await focusedHeading(page,id);
    const m=await measurements(page,id); results.push(m);
    expect(m.tools.top,`${id} controls below content`).toBeGreaterThanOrEqual(m.content.bottom-.5);
    expect(m.tools.top,`${id} controls below visible text`).toBeGreaterThanOrEqual(m.textBottom-.5);
    expect(m.documentWidth).toBeLessThanOrEqual(m.viewportWidth);
    m.label = await measureLabelContrast(page, id);
    expect(m.label.opacity).toBe(1);
    expect(m.label.ratio, id + ' chapter label contrast').toBeGreaterThanOrEqual(4.5);
    if(id==='projects'){
      await navigate(page, id);
      for(const summary of await page.locator('#projects summary').all()) await summary.click();
      const expanded=await measurements(page,id);results.push({...expanded,state:'all disclosures expanded'});
      expect(expanded.tools.top).toBeGreaterThanOrEqual(expanded.textBottom-.5);
      await page.screenshot({path:path.join(evidence,'screenshots',`${info.project.name}-a04-all-projects-expanded.png`)});
      for(const summary of await page.locator('#projects summary').all()) await summary.click();
    }
  }
  await navigate(page,'home');
  for(const id of ids.slice(1)){
    await page.locator('.chapter.is-active .next').focus();
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
      const header=await page.locator('.site-header').boundingBox();
      expect(m.content.top,`${id} content clears header at ${size.width}px`).toBeGreaterThanOrEqual(header.y+header.height);
    }
  }
  fs.writeFileSync(path.join(evidence,'breakpoint-footer-matrix.json'),JSON.stringify(results,null,2));
});
