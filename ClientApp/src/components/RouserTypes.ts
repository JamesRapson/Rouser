
export class NetworkAdapterDetails {
    
    macAddress: string;
    subnet?: string;
    ipAddress?: string;
}

export class ComputerDetails {
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

export class EditComputerCtrl {
    mode: EditComputerCtrlModeEnum;
    computer: ComputerDetails;
    onSave: Function;
    onCancel: Function;
}

export class DeleteDialogCtrl {
    computer: ComputerDetails;
    onDelete: Function;
    onCancel: Function;
}

export class Alert{
    message: string;
    style: string;
}

