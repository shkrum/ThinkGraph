import { test, expect } from '@playwright/test';

test.describe('Video Priority Playback and AI File Format Specification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gnode');
  });

  test('should sort priorities correctly for numbers, strings, and empty values', async ({ page }) => {
    const sortResults = await page.evaluate(() => {
      const cmp = window.comparePriorities;
      return {
        numSort: ['10', '2', '1'].sort(cmp),
        stringSort: ['VIP', 'HI', 'CRIT'].sort(cmp),
        alphaNumSort: ['P10', 'P01', 'P02'].sort(cmp),
        mixedSort: ['B', '2', 'A', '1'].sort(cmp),
        emptySort: ['', 'P01', ''].sort(cmp)
      };
    });

    // Numbers must sort numerically: 1 < 2 < 10
    expect(sortResults.numSort).toEqual(['1', '2', '10']);

    // Strings sort alphabetically
    expect(sortResults.stringSort).toEqual(['CRIT', 'HI', 'VIP']);

    // Alphanumeric strings sort naturally: P01 < P02 < P10
    expect(sortResults.alphaNumSort).toEqual(['P01', 'P02', 'P10']);

    // Numbers sort before non-numeric strings
    expect(sortResults.mixedSort).toEqual(['1', '2', 'A', 'B']);

    // Non-empty priorities sort before empty ones
    expect(sortResults.emptySort[0]).toBe('P01');
  });

  test('should initialize demo video nodes with priority playback sequence', async ({ page }) => {
    // Assert all demo video nodes are attached
    const homerVid = page.locator('.node-video-player[data-node-id="homer"]');
    const bartVid = page.locator('.node-video-player[data-node-id="bart"]');
    const burnsVid = page.locator('.node-video-player[data-node-id="burns"]');
    const walterVid = page.locator('.node-video-player[data-node-id="walter"]');

    await expect(homerVid).toBeAttached();
    await expect(bartVid).toBeAttached();
    await expect(burnsVid).toBeAttached();
    await expect(walterVid).toBeAttached();

    // Check manager state: 4 priority tiers in Demo 1: CH3 -> D'H -> EAT -> EXC
    const managerState = await page.evaluate(() => {
      const mgr = window.videoPriorityManager;
      return {
        groupsCount: mgr.groups.length,
        sortedPriorities: mgr.groups.map(g => g.priority),
        activePriority: mgr.groups[mgr.currentGroupIndex]?.priority,
        activeNodeIds: Array.from(mgr.activeVideoNodeIds)
      };
    });

    expect(managerState.groupsCount).toBe(4);
    // Alphabetical string sorting order for priorities: CH3 < D'H < EAT < EXC
    expect(managerState.sortedPriorities).toEqual(['CH3', "D'H", 'EAT', 'EXC']);
    expect(managerState.activePriority).toBe('CH3');
    expect(managerState.activeNodeIds).toContain('walter');

    // Simulate completion of Walter's video -> should advance to Homer ("D'H")
    await page.evaluate(() => {
      const wVid = document.querySelector('.node-video-player[data-node-id="walter"]');
      wVid.dispatchEvent(new Event('ended'));
    });

    await page.waitForFunction(() => {
      const hVid = document.querySelector('.node-video-player[data-node-id="homer"]');
      return hVid?.dataset.priorityActive === 'true';
    });
  });

  test('should sequentially play videos based on priorities and advance when ended', async ({ page }) => {
    // Add two test video nodes with priorities "1" and "2"
    await page.evaluate(() => {
      state.nodes = [
        {
          id: 'vid_node_p1',
          x: 60,
          y: 60,
          w: 240,
          h: 220,
          title: 'Priority 1 Video',
          desc: 'Plays first',
          priority: '1',
          shape: 'rounded',
          imageUrl: 'images/homer_bushes.mp4',
          mediaType: 'video'
        },
        {
          id: 'vid_node_p2',
          x: 360,
          y: 60,
          w: 240,
          h: 220,
          title: 'Priority 2 Video',
          desc: 'Plays second',
          priority: '2',
          shape: 'rounded',
          imageUrl: 'images/homer_bushes.mp4',
          mediaType: 'video'
        }
      ];
      state.connections = [];
      renderAll();
    });

    // Wait for nodes to render
    await page.waitForSelector('.node-video-player[data-node-id="vid_node_p1"]');
    await page.waitForSelector('.node-video-player[data-node-id="vid_node_p2"]');

    // Give priority manager a tick to sync
    await page.waitForTimeout(100);

    // Initially, Priority 1 video should be active, Priority 2 inactive
    const initialStatus = await page.evaluate(() => {
      const v1 = document.querySelector('.node-video-player[data-node-id="vid_node_p1"]');
      const v2 = document.querySelector('.node-video-player[data-node-id="vid_node_p2"]');
      return {
        v1Active: v1.dataset.priorityActive,
        v2Active: v2.dataset.priorityActive
      };
    });

    expect(initialStatus.v1Active).toBe('true');
    expect(initialStatus.v2Active).toBe('false');

    // Simulate completion of Priority 1 video
    await page.evaluate(() => {
      const v1 = document.querySelector('.node-video-player[data-node-id="vid_node_p1"]');
      v1.dispatchEvent(new Event('ended'));
    });

    // After v1 ends, Priority 2 video should become active!
    await page.waitForFunction(() => {
      const v2 = document.querySelector('.node-video-player[data-node-id="vid_node_p2"]');
      return v2?.dataset.priorityActive === 'true';
    });

    const secondStatus = await page.evaluate(() => {
      const v1 = document.querySelector('.node-video-player[data-node-id="vid_node_p1"]');
      const v2 = document.querySelector('.node-video-player[data-node-id="vid_node_p2"]');
      return {
        v1Active: v1.dataset.priorityActive,
        v2Active: v2.dataset.priorityActive
      };
    });

    expect(secondStatus.v1Active).toBe('false');
    expect(secondStatus.v2Active).toBe('true');

    // Simulate completion of Priority 2 video -> should loop back to Priority 1
    await page.evaluate(() => {
      const v2 = document.querySelector('.node-video-player[data-node-id="vid_node_p2"]');
      v2.dispatchEvent(new Event('ended'));
    });

    await page.waitForFunction(() => {
      const v1 = document.querySelector('.node-video-player[data-node-id="vid_node_p1"]');
      return v1?.dataset.priorityActive === 'true';
    });
  });

  test('should display direct link to AI file format description and prompt copy button', async ({ page }) => {
    // Open AI Help modal
    const aiHelpBtn = page.locator('#btn-ai-help');
    await aiHelpBtn.click();

    const modal = page.locator('#ai-help-modal');
    await expect(modal).toBeVisible();

    // Verify direct link element and URL input
    const directLink = page.locator('#ai-spec-direct-link');
    await expect(directLink).toBeVisible();
    await expect(directLink).toHaveAttribute('href', /raw\.githubusercontent\.com\/shkrum\/ThinkGraph\/main\/AI_INSTRUCTIONS\.md/);

    const urlInput = page.locator('#ai-spec-url-input');
    await expect(urlInput).toBeVisible();
    await expect(urlInput).toHaveValue(/raw\.githubusercontent\.com\/shkrum\/ThinkGraph\/main\/AI_INSTRUCTIONS\.md/);

    // Verify Copy Link and Copy Quick Prompt buttons
    const copyLinkBtn = page.locator('#btn-copy-spec-link');
    await expect(copyLinkBtn).toBeVisible();

    const copyQuickPromptBtn = page.locator('#btn-copy-quick-prompt');
    await expect(copyQuickPromptBtn).toBeVisible();

    // Verify prompt text includes file creation instructions and video priority
    const helpContent = page.locator('#ai-help-text');
    await expect(helpContent).toContainText('.umlgraph File Format Instructions');
    await expect(helpContent).toContainText('Video Priority Playback');

    // Close modal
    await page.locator('#btn-close-ai-help').click();
    await expect(modal).toBeHidden();
  });

  test('should serve AI format specification documentation files', async ({ page }) => {
    // Check static raw format markdown
    const mdResponse = await page.goto('/ai-format.md');
    expect(mdResponse.status()).toBe(200);
    const mdText = await page.content();
    expect(mdText).toContain('UML Graph Studio (.umlgraph)');

    // Check html format documentation page
    const htmlResponse = await page.goto('/ai-format.html');
    expect(htmlResponse.status()).toBe(200);
    const htmlTitle = await page.title();
    expect(htmlTitle).toContain('AI Agent File Format Specification');
  });
});

