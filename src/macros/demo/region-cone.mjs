const regionData = {
  name: "test",
  highlightMode: "coverage",
  shapes: [{
    x: 0,
    y: 0,
    radius: 3 * canvas.grid.size,
    angle: 60,
    type: "cone",
    gridBased: true,
  }],
};

const onMove = e => {
  const changes = canvas.grid.getSnappedPoint(e.position, {
    mode: CONST.GRID_SNAPPING_MODES.CENTER,
  });
  Object.assign(e.position, changes);
};
canvas.regions.placeRegion(regionData, { onMove });