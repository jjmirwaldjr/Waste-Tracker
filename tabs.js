function activateTab(tab, content) {
    const allTabs = document.querySelectorAll('.tab');
    const allContents = document.querySelectorAll('.tab-content');

    // Deactivate all tabs and hide their contents
    allTabs.forEach(t => t.classList.remove('active'));
    allContents.forEach(c => c.classList.add('hidden'));

    // Activate the selected tab and show its content
    tab.classList.add('active');
    content.classList.remove('hidden');
}

// Ensure this function applies when switching tabs
document.addEventListener('DOMContentLoaded', function () {
    const profilerTab = document.getElementById('profiler-tab');
    const profilerTracker = document.getElementById('profiler-tracker');
    const productTab = document.getElementById('product-tab');
    const hoursTab = document.getElementById('hours-tab');
    const productTracker = document.getElementById('product-tracker');
    const hoursTracker = document.getElementById('hours-tracker');

    profilerTab.addEventListener('click', function () {
        activateTab(profilerTab, profilerTracker);
    });

    productTab.addEventListener('click', function () {
        activateTab(productTab, productTracker);
    });

    hoursTab.addEventListener('click', function () {
        activateTab(hoursTab, hoursTracker);
    });
});