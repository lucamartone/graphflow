let addingNodeMode = false;
let addingEdgeMode = false;

export function setAddingNodeMode(mode) {
    addingNodeMode = mode;
}

export function setAddingEdgeMode(mode) {
    addingEdgeMode = mode;
}

export function isAddingNodeMode() {
    return addingNodeMode;
}

export function isAddingEdgeMode() {
    return addingEdgeMode;
}