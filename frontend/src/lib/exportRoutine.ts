import * as htmlToImage from 'html-to-image';

interface ExportOptions {
  routineRef: React.RefObject<HTMLElement | null>;
  filename?: string;
  width?: number;
  pixelRatio?: number;
}

export const exportRoutineToPNG = async ({
  routineRef,
  filename = 'CRABU_Routine',
  width = 1200, // Fixed desktop width for perfect exports
  pixelRatio = 3, // High definition
}: ExportOptions): Promise<boolean> => {
  if (!routineRef?.current) {
    console.error("Routine table not found");
    return false;
  }

  const originalNode = routineRef.current;
  
  // Detect theme to give the PNG the correct background color
  const isDarkMode = document.documentElement.classList.contains('dark');
  const bgColor = isDarkMode ? '#0f172a' : '#ffffff'; // Tailwind slate-900 or white

  // Create the hidden staging area
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = `${width}px`;
  container.style.transformOrigin = 'top left';

  if (isDarkMode) {
    container.classList.add('dark');
  }

  document.body.appendChild(container);

  // Clone the routine
  const clonedNode = originalNode.cloneNode(true) as HTMLElement;

  // Remove any UI elements we don't want in the screenshot (like 'Remove' buttons)
  const exportHideElements = clonedNode.querySelectorAll('.export-hide');
  exportHideElements.forEach(el => el.remove());

  // Force the clone to render as a full desktop grid
  clonedNode.style.width = `${width}px`;
  clonedNode.style.minWidth = `${width}px`;
  clonedNode.style.height = 'auto';
  clonedNode.style.overflow = 'visible';
  
  container.appendChild(clonedNode);

    try {
    // ── FORCE DESKTOP VIEW IN THE CLONE ──
    
    // 🔥 ADD PREMIUM PADDING TO THE DOWNLOADED IMAGE
    clonedNode.style.padding = '32px';
    clonedNode.style.backgroundColor = bgColor;
    clonedNode.style.borderRadius = '0px';

    // 1. Force the Grid
    const desktopGrid = clonedNode.querySelector('.crabu-desktop-grid') as HTMLElement;
    if (desktopGrid) {
      desktopGrid.classList.remove('hidden', 'md:block');
      desktopGrid.style.display = 'block';
      desktopGrid.style.width = '100%';
    }
    const mobileCards = clonedNode.querySelector('.crabu-mobile-cards') as HTMLElement;
    if (mobileCards) {
      mobileCards.classList.remove('block', 'md:hidden');
      mobileCards.style.display = 'none';
    }

    // 2. Force the Header Banner to be horizontal (No wrapping)
    const headerBanner = clonedNode.querySelector('.export-header-banner') as HTMLElement;
    if (headerBanner) {
      headerBanner.classList.remove('flex-col');
      headerBanner.classList.add('flex-row', 'items-center');
    }

    // 3. Force the Header Stats to align right
    const headerStats = clonedNode.querySelector('.export-header-stats') as HTMLElement;
    if (headerStats) {
      headerStats.classList.remove('items-start', 'border-t', 'pt-3', 'w-full');
      headerStats.classList.add('items-end', 'border-t-0', 'pt-0', 'w-auto');
    }

    // 🔥 4. FORCE THE ICON TO SHOW ON MOBILE EXPORTS
    const exportIcon = clonedNode.querySelector('.export-icon') as HTMLElement;
    if (exportIcon) {
      exportIcon.classList.remove('hidden', 'sm:block');
      exportIcon.style.display = 'block';
    }

    // 🔥 5. PREVENT TITLE TRUNCATION IN EXPORT
    const titleWrapper = clonedNode.querySelector('.export-title-wrapper') as HTMLElement;
    if (titleWrapper) {
        titleWrapper.classList.remove('overflow-hidden', 'flex-wrap');
        titleWrapper.style.flexWrap = 'nowrap'; // Lock tags to the same line
    }
    const titleText = clonedNode.querySelector('.export-title') as HTMLElement;
    if (titleText) {
        titleText.classList.remove('truncate');
        titleText.style.whiteSpace = 'nowrap'; // Lock text to a single line
        titleText.style.minWidth = 'max-content'; // Prevent any squeezing
    }

    // Wait 150ms for fonts and Tailwind styles to fully render on the clone
    await new Promise(resolve => setTimeout(resolve, 150));

    const captureWidth = Math.max(width, clonedNode.scrollWidth);

    const dataUrl = await htmlToImage.toPng(clonedNode, {
      quality: 1.0,
      pixelRatio,
      backgroundColor: bgColor,
      width: captureWidth,
      height: clonedNode.scrollHeight,
      style: { margin: "0" }
    });

    // Annihilate the staging area
    document.body.removeChild(container);

    // Trigger the download
    const link = document.createElement('a');
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataUrl;
    link.click();
    
    return true;
  } catch (error) {
    console.error('Error exporting routine:', error);
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    return false;
  }
}