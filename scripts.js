/* =============================================
   Qiongyu (Quoine) Liu – portfolio site script
   ---------------------------------------------
   • Vanilla‑JS navigation for single‑page layout
   • Light‑box viewer & three‑layer gallery logic
   • State is persisted in sessionStorage
   ---------------------------------------------
   2025‑06‑05  — complete revision of the section
   selector for Unit‑1/2 galleries so that the
   submenu thumbnails now open correctly.
   =============================================*/

/***********************************************/
/* ========= 0) 工具：统一回到页面顶部 ========= */
function scrollToTop () {
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop           = 0;
    const mc = document.querySelector('.main-content');
    if (mc) mc.scrollTop = 0;
  });
}

/***********************************************/
/* ============ DOM SELECTOR 缓存 ============ */
const navItems       = document.querySelectorAll('#navList li');
const pages          = document.querySelectorAll('.page-section');
const printsNav      = document.getElementById('printsNav');
const titleLink      = document.querySelector('.title-link');

const subNav         = document.getElementById('subNavButtons');
const btnBackSub     = document.getElementById('btnBackSub');
const btnNextSub     = document.getElementById('btnNextSub');

const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');

/***********************************************/
/* ========== 0) PAGE‑STATE PERSISTENCE ======= */
function savePageState () {
  const activeSection = document.querySelector('.page-section.active');
  if (activeSection) sessionStorage.setItem('activeSectionId', activeSection.id);
  sessionStorage.setItem('scrollY', 0);
}
function restorePageState () {
  const storedId = sessionStorage.getItem('activeSectionId');
  if (storedId) {
    navItems.forEach(n => n.classList.remove('active'));
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(storedId)?.classList.add('active');
    document.querySelector(`#navList li[data-target="${storedId}"]`)?.classList.add('active');
    printsNav?.classList.toggle('active', storedId === 'prints-zine');
  }
  scrollToTop();
  updateSubNav();
}
window.addEventListener('DOMContentLoaded', restorePageState);
window.addEventListener('beforeunload',   savePageState);

/***********************************************/
/* ========== 0.1) 子页 Back / Next 逻辑 ======= */
const subGroups = {
  Unit1  : ['sectionA', 'sectionB', 'sectionC', 'sectionD'],
  Gallery: ['Gallery-series-1', 'Gallery-series-2', 'Gallery-series-3'],
  Unit2  : ['sectionE', 'sectionF', 'sectionG', 'sectionH'],
};
function getCurrentGroupId (sectionId) {
  for (const key in subGroups) if (subGroups[key].includes(sectionId)) return key;
  return null;
}
function updateSubNav () {
  const active = document.querySelector('.page-section.active');
  const gid    = active ? getCurrentGroupId(active.id) : null;
  subNav.style.display = gid ? 'flex' : 'none';
}
function navigateSub (delta) {
  const active = document.querySelector('.page-section.active');
  if (!active) return;
  const gid = getCurrentGroupId(active.id);
  if (!gid) return;
  const arr = subGroups[gid];
  const idx = arr.indexOf(active.id);
  const nextIdx  = (idx + delta + arr.length) % arr.length;
  const targetId = arr[nextIdx];

  pages.forEach(p => p.classList.remove('active'));
  document.getElementById(targetId)?.classList.add('active');

  scrollToTop();
  savePageState();
  updateSubNav();
}
btnBackSub?.addEventListener('click', () => navigateSub(-1));
btnNextSub?.addEventListener('click', () => navigateSub(1));

/***********************************************/
/* ========== 1) SIDEBAR NAV SWITCHING ========= */
function closeLightbox () {
  lightboxOverlay.classList.remove('active');
  lightboxImg.src = '';
}
lightboxOverlay.addEventListener('click', e => { if (e.target === lightboxOverlay) closeLightbox(); });

navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(n => n.classList.remove('active'));
    pages.forEach(p => p.classList.remove('active'));
    item.classList.add('active');

    const targetId = item.dataset.target;
    document.getElementById(targetId)?.classList.add('active');
    printsNav?.classList.toggle('active', targetId === 'prints-zine');

    scrollToTop();
    savePageState();
    updateSubNav();
    closeLightbox();
  });
});

titleLink.addEventListener('click', e => {
  e.preventDefault();
  navItems.forEach(n => n.classList.remove('active'));
  pages.forEach(p => p.classList.remove('active'));
  document.getElementById('landing')?.classList.add('active');
  printsNav?.classList.remove('active');

  scrollToTop();
  savePageState();
  updateSubNav();
  closeLightbox();
});

/***********************************************/
/* ========== 2) LIGHTBOX FUNCTIONALITY ======== */
let lightboxIndex   = 0;
let lightboxGallery = [];
const gallerySelectors = ['.gallery img', '.p-gallery img', '.viewer-large', '.image-block img'];
const galleryImages    = document.querySelectorAll(gallerySelectors.join(', '));

galleryImages.forEach(img => {
  img.addEventListener('click', e => {
    const parent = e.target.closest('.gallery, .p-gallery, .image-block');
    lightboxGallery = parent ? Array.from(parent.querySelectorAll('img')) : [e.target];
    lightboxIndex   = lightboxGallery.indexOf(e.target);
    openLightbox();
  });
});

function openLightbox () {
  if (!lightboxGallery[lightboxIndex]) return;
  const fullSrc = lightboxGallery[lightboxIndex].dataset.full || lightboxGallery[lightboxIndex].src;
  lightboxImg.src = fullSrc;
  lightboxOverlay.classList.add('active');
  updateLightboxArrows();
}
function updateLightboxArrows () {
  if (lightboxGallery.length <= 1) {
    lightboxPrev.classList.add('hidden');
    lightboxNext.classList.add('hidden');
  } else {
    lightboxPrev.classList.toggle('hidden', lightboxIndex === 0);
    lightboxNext.classList.toggle('hidden', lightboxIndex === lightboxGallery.length - 1);
  }
}
function lightboxShowNext () { lightboxIndex = (lightboxIndex + 1) % lightboxGallery.length; openLightbox(); }
function lightboxShowPrev () { lightboxIndex = (lightboxIndex - 1 + lightboxGallery.length) % lightboxGallery.length; openLightbox(); }
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev .addEventListener('click', lightboxShowPrev);
lightboxNext .addEventListener('click', lightboxShowNext);

document.addEventListener('keyup', e => {
  if (!lightboxOverlay.classList.contains('active')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  lightboxShowPrev();
  if (e.key === 'ArrowRight') lightboxShowNext();
});

/***********************************************/
/* ========== 3) 三层 Gallery 结构 ============ */
function toggleActive (elements, targetId) {
  elements.forEach(el => el.classList.remove('active'));
  if (targetId) document.getElementById(targetId)?.classList.add('active');
}
function activateGroupImage (group, idx) {
  const middleItems = group.querySelectorAll('.middle-item');
  const viewerLarge = group.querySelector('.viewer-large');
  if (!viewerLarge || !middleItems.length) return;

  middleItems.forEach(mi => mi.classList.remove('active'));
  middleItems[idx]?.classList.add('active');
  viewerLarge.src        = middleItems[idx]?.dataset.full || '';
  group.dataset.currentIndex = idx;
  savePageState();
}

document.querySelectorAll('.top-item').forEach(top => {
  top.addEventListener('click', () => {
    const targetId    = top.dataset.target;
    const targetGroup = document.getElementById(targetId);
    if (!targetGroup) return;
    if (targetGroup.classList.contains('active')) {
      targetGroup.classList.remove('active');
    } else {
      toggleActive(document.querySelectorAll('.gallery-group'));
      targetGroup.classList.add('active');
      activateGroupImage(targetGroup, 0);
    }
  });
});

document.querySelectorAll('.middle-item').forEach(item => {
  item.addEventListener('click', () => {
    const group = item.closest('.gallery-group');
    const idx   = parseInt(item.dataset.index, 10);
    if (group && !isNaN(idx)) activateGroupImage(group, idx);
  });
});

/* ===== 在所有 gallery 组里确保左右按钮为 SVG（自动创建或替换） ===== */
function ensureSvgArrowButtons () {
  const prevSVG = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 4 L7 12 L15 20" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const nextSVG = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 4 L17 12 L9 20"  fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  document.querySelectorAll('.gallery-group .gallery-bottom-row').forEach(row => {
    let prev = row.querySelector('.viewer-prev');
    let next = row.querySelector('.viewer-next');

    if (!prev) {
      prev = document.createElement('button');
      prev.className = 'viewer-prev';
      prev.setAttribute('aria-label','Previous');
      row.appendChild(prev);
    }
    if (!next) {
      next = document.createElement('button');
      next.className = 'viewer-next';
      next.setAttribute('aria-label','Next');
      row.appendChild(next);
    }
    prev.innerHTML = prevSVG;
    next.innerHTML = nextSVG;
  });
}

/* 在绑定左右切换事件之前执行 */
ensureSvgArrowButtons();


document.querySelectorAll('.gallery-group').forEach(group => {
  const btnPrev = group.querySelector('.viewer-prev');
  const btnNext = group.querySelector('.viewer-next');
  const middle  = group.querySelectorAll('.middle-item');
  if (!btnPrev || !btnNext || !middle.length) return;
  group.dataset.currentIndex = 0;
  btnPrev.addEventListener('click', () => {
    const cur = parseInt(group.dataset.currentIndex, 10) || 0;
    const nxt = cur > 0 ? cur - 1 : middle.length - 1;
    activateGroupImage(group, nxt);
  });
  btnNext.addEventListener('click', () => {
    const cur = parseInt(group.dataset.currentIndex, 10) || 0;
    const nxt = cur < middle.length - 1 ? cur + 1 : 0;
    activateGroupImage(group, nxt);
  });
});

/***********************************************/
/* ========== 4) Gallery 缩略图 -> 二级 ========= */
// 2025‑06‑05  — rewritten so that clicking a series
// thumbnail in Unit‑1 or Unit‑2 actually navigates.

function handleBackButton (currentId, targetId) {
  // hide everything first so only the new section is visible
  pages.forEach(p => p.classList.remove('active'));

  // reveal the requested gallery page
  document.getElementById(targetId)?.classList.add('active');

  scrollToTop();
  savePageState();
  updateSubNav();
}

document.querySelectorAll('#illus-series-gallery img').forEach(img => {
  img.addEventListener('click', () => {
    const targetId      = img.dataset.target;          // e.g. Gallery-series-1
    const parentSection = img.closest('.page-section');

    if (targetId && parentSection) {
      handleBackButton(parentSection.id, targetId);
    }
  });
});

/* Unit 1/2 thumbnail → 子页（保持不变） */
document.querySelectorAll('#unitGallery figure').forEach(fig => {
  fig.addEventListener('click', () => {
    const target = fig.dataset.target;
    if (!target) return;

    ['Unit1', 'sectionA', 'sectionB', 'sectionC', 'sectionD',
     'Unit2', 'sectionE', 'sectionF', 'sectionG', 'sectionH']
      .forEach(secId => document.getElementById(secId)?.classList.remove('active'));

    document.getElementById(target)?.classList.add('active');

    scrollToTop();
    savePageState();
    updateSubNav();
  });
});
// ===== 默认展开 gallery-complex 的第一组 =====
window.addEventListener('DOMContentLoaded', () => {
  const firstGroup = document.querySelector('.gallery-group'); // 第一组
  if (firstGroup) {
    toggleActive(document.querySelectorAll('.gallery-group'), firstGroup.id);
    firstGroup.classList.add('active');
    activateGroupImage(firstGroup, 0); // 显示第 0 张大图
  }
});


/* ========== Unit 3 子导航切换（基于 href 的 hash） ========== */
(function () {
  const unit3 = document.getElementById('Unit3');
  if (!unit3) return;

  const links  = Array.from(unit3.querySelectorAll('.u3-subnav__link'));
  const panels = Array.from(unit3.querySelectorAll('div[id^="u3-"]'));
  if (!links.length || !panels.length) return;

  function showPanelById(id, updateHash = true) {
    panels.forEach(p => { p.hidden = (p.id !== id); });
    links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
    if (updateHash) {
      try { history.replaceState(null, '', '#' + id); } catch (e) {}
    }
  }

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const id = link.getAttribute('href').replace('#', '');
      if (id) showPanelById(id, true);
    });
  });

  // 初始：若 hash 命中就用 hash，否则显示第一个
  const h = location.hash.replace('#', '');
  const init = panels.some(p => p.id === h) ? h : panels[0].id;
  showPanelById(init, false);
})();

// Unit3 的 Gallery Hub：点击缩略图 → 跳到对应页面/区块
document.querySelectorAll('#u3-Gallery [data-target]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    const targetId  = el.dataset.target;      // 目标 section 的 id（如 Unit1 / sectionE / Gallery-series-1）
    const scrollSel = el.dataset.scroll || ''; // 可选：到达后滚到某锚点

    // 关闭所有 section，激活目标
    document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
    document.getElementById(targetId)?.classList.add('active');

    // 如需滚到目标里的具体位置
    if (scrollSel) document.querySelector(scrollSel)?.scrollIntoView({ behavior: 'smooth' });

    scrollToTop();
    savePageState();
    updateSubNav();
    if (typeof closeLightbox === 'function') closeLightbox();
  });
});

/* === Unit-3 顶部子导航：悬浮版开关 === */
let u3StickyNav = null;

function bindU3Subnav(root) {
  // 复用你 Unit-3 子导航现有的 hash 切换逻辑：点击时只切到 #u3-xxx 面板
  root.querySelectorAll('.u3-subnav__link').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.getAttribute('href')?.replace('#', '');
      // 回到 Unit-3 区域并切换 Panel
      document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
      document.getElementById('Unit3')?.classList.add('active');
      const panel = id ? document.getElementById(id) : null;
      if (panel) {
        // 隐藏其它 u3 面板
        document.querySelectorAll('#Unit3 div[id^="u3-"]').forEach(p => p.hidden = true);
        panel.hidden = false;
      }
      // 既然回到 Unit-3，就可以关掉悬浮导航
      disableU3Sticky();
      scrollToTop();
      savePageState();
      updateSubNav();
      if (typeof closeLightbox === 'function') closeLightbox();
    });
  });
}

function enableU3Sticky () {
  // 找到 Unit-3 原本的子导航（你站里它通常是 .u3-subnav 容器）
  const u3Local = document.querySelector('#Unit3 .u3-subnav');
  if (!u3Local) return;
  if (!u3StickyNav) {
    u3StickyNav = u3Local.cloneNode(true);
    u3StickyNav.id = 'u3StickyNav';
    u3StickyNav.classList.add('u3-sticky');
    document.body.appendChild(u3StickyNav);
    bindU3Subnav(u3StickyNav);
  }
  u3StickyNav.style.display = 'block';
  document.body.classList.add('u3-sticky-padding');
}
function disableU3Sticky () {
  if (u3StickyNav) u3StickyNav.style.display = 'none';
  document.body.classList.remove('u3-sticky-padding');
}

/* === 挂钩 1：Unit-3 → Gallery Hub 缩略图点击时，开启悬浮导航 === */
// 你前面加过的委托里，插入 enableU3Sticky()：
// 注意你的 Unit-3 面板 id：u3-gallery / u3-Gallery，按你文件里实际大小写来
document.addEventListener('click', function (e) {
  const el = e.target.closest('#u3-Gallery [data-target]'); // ← 如果是小写就改成 '#u3-gallery'
  if (!el) return;
  e.preventDefault();
  const targetId  = el.dataset.target;
  const scrollSel = el.dataset.scroll || '';

  // 开启悬浮的 Unit-3 子导航
  enableU3Sticky();

  // 切换到目标页面
  document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
  document.getElementById(targetId)?.classList.add('active');
  if (scrollSel) document.querySelector(scrollSel)?.scrollIntoView({ behavior: 'smooth' });

  scrollToTop();
  savePageState();
  updateSubNav();
  if (typeof closeLightbox === 'function') closeLightbox();
});

/* === 挂钩 2：从侧栏切换其它主页面时，自动关闭悬浮导航 === */
document.querySelectorAll('#navList li').forEach(item => {
  item.addEventListener('click', () => {
    const targetId = item.dataset.target;
    // 如果进入 Unit-3，本地导航可见，不需要悬浮；否则收起
    if (targetId === 'Unit3') {
      disableU3Sticky();
    } else {
      disableU3Sticky();
    }
  });
});



