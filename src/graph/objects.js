export function Node(id, x, y, radius, properties) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.properties = properties;
    // this.isSelected = isSelected;
}

export function Line(id1, id2, multiple, x1, y1, x2, y2, properties) {
    this.id1 = id1;
    this.id2 = id2;
    this.multiple = multiple;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.properties = properties;
}
