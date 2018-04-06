export interface GroupTreeView {
    groupName: string;
    groupId: number;
    parentId: number;
    hasChildren: boolean;
    groups: GroupTreeView[];
    selected: boolean;
}
