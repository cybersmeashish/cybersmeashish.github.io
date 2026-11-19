"use strict";
(() => {
  const search = document.querySelector("#problem-search");
  const groups = [...document.querySelectorAll(".problem-group")];
  const counter = document.querySelector("#problem-count");
  const empty = document.querySelector("#no-results");
  const expand = document.querySelector("#expand-problems");
  let expanded = false;
  search.addEventListener("input", () => {
    const query = search.value.trim().toLocaleLowerCase();
    let matches = 0;
    let visibleGroups = 0;
    groups.forEach(group => {
      let visible = 0;
      group.querySelectorAll(".problem").forEach(problem => {
        const match = !query || problem.textContent.toLocaleLowerCase().includes(query);
        problem.hidden = !match;
        if (match) visible++;
      });
      group.hidden = visible === 0;
      group.querySelector(".group-count").firstChild.textContent = `${visible} ${visible === 1 ? "problem" : "problems"} `;
      group.open = query ? visible > 0 : expanded;
      matches += visible;
      if (visible) visibleGroups++;
    });
    counter.textContent = `${matches} ${matches === 1 ? "problem" : "problems"} across ${visibleGroups} ${visibleGroups === 1 ? "service area" : "service areas"}`;
    empty.hidden = matches !== 0;
  });
  expand.addEventListener("click", () => {
    expanded = !expanded;
    groups.forEach(group => { if (!group.hidden) group.open = expanded; });
    expand.textContent = expanded ? "Collapse all" : "Expand all";
  });
  const priority = document.querySelector("#priority");
  const deadline = document.querySelector("#deadline");
  const question = document.querySelector("#decision-question");
  const measure = document.querySelector("#decision-measure");
  const link = document.querySelector("#collaboration-link");
  fetch("assets/services.json")
    .then(response => { if (!response.ok) throw new Error("Catalog unavailable"); return response.json(); })
    .then(catalog => {
      const update = () => {
        const selected = catalog.pillars.find(p => p.id === priority.value);
        if (!selected) return;
        question.textContent = selected.decision;
        measure.textContent = selected.measure;
        const url = new URL("https://github.com/cybersmeashish/cybersmeashish/issues/new");
        url.searchParams.set("template", "collaboration.yml");
        url.searchParams.set("title", `[Collaboration] ${selected.short} — ${deadline.value}`);
        url.searchParams.set("decision", selected.decision);
        url.searchParams.set("outcome", `Discuss an agreed scope for: ${selected.outputs.join("; ")}.`);
        url.searchParams.set("timing", deadline.value);
        link.href = url.toString();
      };
      priority.addEventListener("change", update);
      deadline.addEventListener("change", update);
      update();
    })
    .catch(() => {
      // The static question and collaboration URL remain available if fetch fails.
      priority.disabled = true;
      deadline.disabled = true;
    });
})();
