export interface GroupTreeView {
    groupName: string;
    groupId: number;
    parentId: number;
    level: number;
    hasChildren: boolean;
    displayChildren: boolean;
    groups: GroupTreeView[];
    selected: boolean;
    disabled: boolean;
    filteredProjects: number;
    unfilteredProjects: number;
}
