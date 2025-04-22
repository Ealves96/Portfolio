document.addEventListener('DOMContentLoaded', () => {
  const projectItems = document.querySelectorAll('.project-item');
  const tabLists     = document.querySelectorAll('.tabs-list, .tabs-list-mobile');

  /* -----------  F I L T R A G E  ----------- */
  function filterProjects(category) {
    projectItems.forEach(item => {
      const categories = (item.dataset.category || '').split(' ');
      const show       = category === 'all' || categories.includes(category);
      item.classList.toggle('hidden', !show);
    });
  }

  /* -------- Synchro état "active" ---------- */
  function setActive(category) {
    document.querySelectorAll('.tab-item.active, .tab-item-mobile.active')
            .forEach(t => t.classList.remove('active'));

    document.querySelectorAll(`[data-category="${category}"]`)
            .forEach(t => t.classList.add('active'));
  }

  /* -------------  C l i c k  ---------------- */
  tabLists.forEach(list => {
    list.addEventListener('click', e => {
      const t = e.target;
      if (t.classList.contains('tab-item') || t.classList.contains('tab-item-mobile')) {
        const cat = t.dataset.category || 'all';
        setActive(cat);
        filterProjects(cat);
      }
    });
  });

  /* -----------  I n i t i a l i s a t i o n  ----------- */
  const defaultCat = document.querySelector('.tab-item.active')?.dataset.category || 'all';
  filterProjects(defaultCat);
});
