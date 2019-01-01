import * as React from "react";
import { Button, ControlLabel, Form, FormControl, FormGroup, Modal, Col, Alert } from "react-bootstrap";
import * as Rouser from "./RouserTypes";

export class EditComputerCtrl extends React.Component<Rouser.IEditComputerCtrl, any> {

    constructor(props: Rouser.IEditComputerCtrl) {
        super(props);

        if (props.mode === Rouser.EditComputerCtrlModeEnum.Edit) {

            this.state = {
                computerId: props.computer.id,
                computerName: props.computer.name,
                computerDescription: props.computer.description,
                computerUser: props.computer.user,
                computerSubnet: props.computer.networkAdapters[0].subnet,
                computerIPAddress: props.computer.networkAdapters[0].ipAddress,
                computerMACAddress: props.computer.networkAdapters[0].macAddress,
            };

        } else {

            this.state = {
                errorMessage: null,
                computerId: null,
                computerName: "",
                computerDescription: "",
                computerSubnet: "",
                computerIPAddress: "",
                computerMACAddress: "",
                computerUser: "",
                mode: props.mode
            };
        }

        this.handleSave = this.handleSave.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    handleSave(computer : Rouser.ComputerDetails) {
        if (this.props.onSave)
            this.props.onSave(computer);
    }

    handleCancel() {
        if (this.props.onCancel)
            this.props.onCancel();
    }

    save(): void {

        const data: Rouser.ComputerDetails = {
            id: this.state.computerId,
            name: this.state.computerName,
            description: this.state.computerDescription,
            user: this.state.computerUser,
            networkAdapters: [
                {
                    ipAddress: this.state.computerIPAddress,
                    macAddress: this.state.computerMACAddress,
                    subnet: this.state.computerSubnet
                }
            ]
        };

        console.log(`Adding/Create new computer : ${this.state.computerName}`);

        const options: RequestInit = {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(data)
        };

        fetch("api/computer", options)
            .then(response => {

                if (response.status !== 200) {
                    response.text().then(
                        res => this.setState({ errorMessage: res })
                    );
                    return null;
                }
                return response.json().then((computer: Rouser.ComputerDetails) => {
                    this.handleSave(computer);
                });
            })
            .catch(err => {
                console.log(err);
                this.setState({ errorMessage: err });
            });
    }

    closeDialog() {
        this.handleCancel();
    }

    render(): JSX.Element {
        
        return (
            <div>
                <Modal.Dialog>
                    <Modal.Header>
                        <Modal.Title>
                            {this.props.mode === Rouser.EditComputerCtrlModeEnum.Create ? "Create Computer" : "Edit Computer"}
                        </Modal.Title>
                    </Modal.Header>

                    {this.state.errorMessage != null ? (
                        <Alert bsStyle="warning">{this.state.errorMessage}</Alert>
                    ) : (null)}

                    <Modal.Body>
                        <Form horizontal>
                            <FormGroup>
                                <Col sm={3}>Name : </Col>
                                <Col sm={9}>
                                    <FormControl type="text" placeholder="Name" value={this.state.computerName}
                                        onChange={(event :any) => this.setState({ computerName: event.currentTarget.value })} />
                                </Col>
                            </FormGroup>
                            <FormGroup>
                                <Col sm={3}>Description : </Col>
                                <Col sm={9}>
                                    <FormControl type="text" placeholder="Description" value={this.state.computerDescription}
                                        onChange={(event: any) => this.setState({ computerDescription: event.currentTarget.value })} />
                                </Col>
                            </FormGroup>
                            <FormGroup>
                                <Col sm={3}>IP Address : </Col>
                                <Col sm={9}>
                                    <FormControl type="text" placeholder="IP Address" value={this.state.computerIPAddress}
                                        onChange={(event: any) => this.setState({ computerIPAddress: event.currentTarget.value })} />
                                </Col>
                            </FormGroup>
                            <FormGroup>
                                <Col sm={3}>MAC Address : </Col>
                                <Col sm={9}>
                                    <FormControl type="text" placeholder="MAC Address" value={this.state.computerMACAddress}
                                        onChange={(event: any) => this.setState({ computerMACAddress: event.currentTarget.value })} />
                                </Col>
                            </FormGroup>
                            <FormGroup>
                                <Col sm={3}>Subnet Mask : </Col>
                                <Col sm={9}>
                                    <FormControl type="text" placeholder="Subnet Mask" value={this.state.computerSubnet}
                                        onChange={(event: any) => this.setState({ computerSubnet: event.currentTarget.value })} />
                                </Col>
                            </FormGroup>
                        </Form>

                    </Modal.Body>

                    <Modal.Footer>
                        <Button bsStyle="primary" onClick={() => this.save()}>Save</Button>
                        <Button onClick={() => this.closeDialog()}>Cancel</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </div>);
    }    
}
