
export interface ComputerDetails {
    id: string;
    name: string;
    description: string;
    user: string;
    macAddress: string;
    ipAddress: string;
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
