import { test, expect } from '@playwright/test';

test.describe('Canvas and Node Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gnode');
  });

  test('should load default Demo 1 (Springfield) with expected nodes and elements', async ({ page }) => {
    // Check diagram name input
    const diagramName = page.locator('#diagram-name');
    await expect(diagramName).toHaveValue(/742 Evergreen Terrace/);

    // Check Springfield nodes exist
    const homerNode = page.locator('.gnode:has-text("Homer J. Simpson")');
    await expect(homerNode).toBeVisible();

    const bartNode = page.locator('.gnode:has-text("Bart Simpson")');
    await expect(bartNode).toBeVisible();

    const margeNode = page.locator('.gnode:has-text("Marge Simpson")');
    await expect(margeNode).toBeVisible();

    const walterNode = page.locator('.gnode:has-text("Heisenberg")');
    await expect(walterNode).toBeVisible();

    const burnsNode = page.locator('.gnode:has-text("Burns")');
    await expect(burnsNode).toBeVisible();

    // Check Homer node has embedded meme video
    const video = homerNode.locator('video');
    await expect(video).toBeVisible();
    await expect(video).toHaveAttribute('src', /homer_bushes\.mp4/);

    // Check priority badges are rendered
    const prioBadge = homerNode.locator('.node-prio-input');
    await expect(prioBadge).toBeVisible();
  });

  test('should add a new node to canvas when Add Node button is clicked', async ({ page }) => {
    const initialCount = await page.locator('.gnode').count();

    // Click "+ Add Node"
    await page.click('#btn-add-node');

    // A new node should appear
    await expect(page.locator('.gnode')).toHaveCount(initialCount + 1);
    await expect(page.locator('.gnode').last()).toBeVisible();
  });

  test('should drag a node and update its coordinates', async ({ page }) => {
    const node = page.locator('.gnode:has-text("Bart Simpson")');
    const initialBox = await node.boundingBox();
    expect(initialBox).not.toBeNull();

    // Drag node by 120px down and right
    await page.mouse.move(initialBox.x + 40, initialBox.y + 20);
    await page.mouse.down();
    await page.mouse.move(initialBox.x + 160, initialBox.y + 140, { steps: 5 });
    await page.mouse.up();

    const newBox = await node.boundingBox();
    expect(newBox.x).toBeGreaterThan(initialBox.x + 50);
    expect(newBox.y).toBeGreaterThan(initialBox.y + 50);
  });

  test('should edit node priority badge directly', async ({ page }) => {
    const bartNode = page.locator('.gnode:has-text("Bart Simpson")');
    const prioInput = bartNode.locator('.node-prio-input');

    await prioInput.click();
    await prioInput.fill('XYZ');
    await prioInput.blur();

    await expect(prioInput).toHaveValue('XYZ');
  });

  test('should delete a selected node using keyboard Delete key', async ({ page }) => {
    // Add a temporary node
    await page.click('#btn-add-node');
    const nodes = page.locator('.gnode');
    const countBefore = await nodes.count();

    // Click the newly added node (the last one)
    const newNode = nodes.last();
    await newNode.click();
    await expect(newNode).toHaveClass(/selected/);

    // Press Delete key
    await page.keyboard.press('Delete');

    // Node count should decrease
    await expect(page.locator('.gnode')).toHaveCount(countBefore - 1);
  });
});
