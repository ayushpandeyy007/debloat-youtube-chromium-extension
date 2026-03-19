const defaults = {
  hideShorts: true,
  hideSuggested: true,
  hideHomeChips: true,
  hideSidebarExtras: true,
};

document.addEventListener("DOMContentLoaded", async () => {
  const settings = await chrome.storage.sync.get(defaults);

  const hideShorts = document.getElementById("hideShorts");
  const hideSuggested = document.getElementById("hideSuggested");
  const hideHomeChips = document.getElementById("hideHomeChips");
  const hideSidebarExtras = document.getElementById("hideSidebarExtras");

  hideShorts.checked = settings.hideShorts;
  hideSuggested.checked = settings.hideSuggested;
  hideHomeChips.checked = settings.hideHomeChips;
  hideSidebarExtras.checked = settings.hideSidebarExtras;

  async function saveAndReload() {
    await chrome.storage.sync.set({
      hideShorts: hideShorts.checked,
      hideSuggested: hideSuggested.checked,
      hideHomeChips: hideHomeChips.checked,
      hideSidebarExtras: hideSidebarExtras.checked,
    });

    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tabs[0]?.id) {
      chrome.tabs.reload(tabs[0].id);
    }
  }

  hideShorts.addEventListener("change", saveAndReload);
  hideSuggested.addEventListener("change", saveAndReload);
  hideHomeChips.addEventListener("change", saveAndReload);
  hideSidebarExtras.addEventListener("change", saveAndReload);
});
