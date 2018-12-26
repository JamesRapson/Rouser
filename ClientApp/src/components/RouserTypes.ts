
export interface NetworkAdapterDetails {
    
    macAddress: string;
    subnet?: string;
    ipAddress?: string;
}

export interface ComputerDetails {
    id?: string;
    name: string;
    description?: string;
    user?: string;
    networkAdapters: NetworkAdapterDetails[];
}

export enum EditComputerCtrlModeEnum {
    Create,
    Edit
}

export interface IEditComputerCtrl {
    mode: EditComputerCtrlModeEnum,
    computer: ComputerDetails,
    onSave: Function,
    onCancel: Function
}

export interface IDeleteDialogCtrl {
    computer: ComputerDetails,
    onDelete: Function,
    onCancel: Function

}

