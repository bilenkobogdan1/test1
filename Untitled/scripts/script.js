const Scene = require("Scene");
const Reactive = require("Reactive");
const Diagnostics = require("Diagnostics");
const Materials = require("Materials");
 
function checkCollision(positionA, positionB, lengthA, lengthB) {
    return Reactive.abs(positionA.sub(positionB)).le(Reactive.add(lengthA.div(2), lengthB.div(2)));
}
 
function checkCollision3D(entityA, entityB) {
    return Reactive.andList([
        checkCollision(entityA.sceneObject.transform.x, entityB.sceneObject.transform.x, entityA.size.x, entityB.size.x),
        checkCollision(entityA.sceneObject.transform.y, entityB.sceneObject.transform.y, entityA.size.y, entityB.size.y),
        checkCollision(entityA.sceneObject.transform.z, entityB.sceneObject.transform.z, entityA.size.z, entityB.size.z)
    ]);
}
 
function checkArrayCollision3D(entityA, otherEntities) {
    return Reactive.orList(otherEntities
        .map(otherEntity => checkCollision3D(entityA, otherEntity))
    );
}
 
class Entity {
    constructor(name, size) {
        this.name = name;
        this.size = size;
    }
 
    async create() {
        this.sceneObject = await Scene.root.findFirst(this.name);
        return this;
    }
}

(async () => {
    const plane0 = await new Entity("plane0", Reactive.point(0.1, 0.1, 0.1)).create();
    const plane1 = await new Entity("plane1", Reactive.point(0.1, 0.1, 0.1)).create();
    const plane2 = await new Entity("plane2", Reactive.point(0.1, 0.1, 0.1)).create();
    const material0 = await Materials.findFirst("material0");
    const material1 = await Materials.findFirst("material1");
    checkCollision3D(plane0, plane1).onOn().subscribe(() => {
        plane1.sceneObject.material = material1;
    });

    checkCollision3D(plane0, plane1).onOff().subscribe(() => {
        plane1.sceneObject.material = material0;
    });

    checkCollision3D(plane0, plane2).onOn().subscribe(() => {
        plane2.sceneObject.material = material1;
    });

    checkCollision3D(plane0, plane2).onOff().subscribe(() => {
        plane2.sceneObject.material = material0;
    });
 
    Diagnostics.watch("plane0 with others", checkArrayCollision3D(plane0, [plane1, plane2]));
    Diagnostics.watch("plane0 with plane1", checkCollision3D(plane0, plane1));
})();