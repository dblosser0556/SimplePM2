export class Characteristic {
    characteristicId: number;
    parentId: number;
    parentName?: string;

    level: number;
    lft = 0;
    rgt = 0;

    characteristicName: string;
    characteristicDesc: string;

}
