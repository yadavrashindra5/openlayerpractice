export const findIntersectPoint = (l, l2) => {
  const [x1, y1] = l[0];
  const [x2, y2] = l[1];
  const [x3, y3] = l2[0];
  const [x4, y4] = l2[1];

  // Check if none of the lines are of length 0
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return false;
  }

  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

  // Lines are parallel
  if (denominator === 0) {
    return false;
  }

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

  // is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return false;
  }

  // Return a object with the x and y coordinates of the intersection
  const x = x1 + ua * (x2 - x1);
  const y = y1 + ua * (y2 - y1);

  if (
    ((x === x1 && y === y1) || (x2 === x && y2 === y)) &&
    ((x === x3 && y === y3) || (x == x4 && y === y4))
  ) {
    return false;
  } else {
    return { x, y };
  }
};

export const findSlope = (l) => {
  const [x1, y1] = l[0];
  const [x2, y2] = l[1];

  if (Math.abs(x2 - x1) <= 0.1) {
    return 90;
  } else {
    const rad = Math.atan((y2 - y1) / (x2 - x1));
    const deg = radToDeg(rad);
    return deg;
  }
};

export const radToDeg = (rad) => {
  const pi = Math.PI;
  return rad * (180 / pi);
};

export const degToRad = (deg) => {
  const pi = Math.PI;
  return deg * (pi / 180);
};
