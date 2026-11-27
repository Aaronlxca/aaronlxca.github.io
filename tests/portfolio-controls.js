async function chapterLink(page, id, { keyboard = false } = {}) {
  const menu = page.locator('.small-nav');
  const summary = menu.locator('summary');
  const selector = 'a[href="#' + id + '"]';
  if (await summary.isVisible()) {
    if (await menu.getAttribute('open') === null) {
      if (keyboard) await summary.press('Enter');
      else await summary.click();
    }
    return menu.locator(selector);
  }
  return page.locator('.wide-nav').locator(selector);
}

module.exports = { chapterLink };
