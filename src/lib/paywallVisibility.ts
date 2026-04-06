export const setPaywallVisibility = (visible: boolean) => {
  window.dispatchEvent(
    new CustomEvent("pricing-plans-visibility", { detail: { visible } })
  );
};
