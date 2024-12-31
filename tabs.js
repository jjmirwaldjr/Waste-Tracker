document.addEventListener('DOMContentLoaded', function() {
    const productTab = document.getElementById('product-tab');
    const hoursTab = document.getElementById('hours-tab');
    const productTracker = document.getElementById('product-tracker');
    const hoursTracker = document.getElementById('hours-tracker');

    productTab.addEventListener('click', function() {
        productTab.classList.add('active');
        hoursTab.classList.remove('active');
        productTracker.classList.remove('hidden');
        hoursTracker.classList.add('hidden');
    });

    hoursTab.addEventListener('click', function() {
        hoursTab.classList.add('active');
        productTab.classList.remove('active');
        hoursTracker.classList.remove('hidden');
        productTracker.classList.add('hidden');
    });
});
function activateTab(tab, content) {
    const allTabs = document.querySelectorAll('.tab');
    const allContents = document.querySelectorAll('.tab-content');

    allTabs.forEach(t => t.classList.remove('active'));
    allContents.forEach(c => c.classList.add('hidden'));

    tab.classList.add('active');
    content.classList.remove('hidden');
}
