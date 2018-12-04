import * as React from "react";
import { Button, ControlLabel, Form, FormControl, FormGroup, Modal, Col, Alert } from "react-bootstrap";
import * as Rouser from "./RouserTypes";

export class EditComputerCtrl extends React.Component<Rouser.IEditComputerCtrl, any> {

    constructor(props: Rouser.IEditComputerCtrl) {
        super(props);

        if (props.mode === Rouser.EditComputerCtrlModeEnum.Edit) {

            console.log(props.computer);

            this.state = {
                computerId: props.computer.id,
                computerName: props.computer.name,
                computerDescription: props.computer.description,
                computerIPAddress: props.computer.ipAddress,
                computerMACAddress: props.computer.macAddress,
                computerUser: props.computer.user,
            };

        } else {

            this.state = {
                errorMessage: null,
                computerId: null,
                computerName: "",
                computerDescription: "",
                computerIPAddress: "",
                computerMACAddress: "",
                computerUser: "",
                mode: props.mode
            };
        }

        this.handleSave = this.handleSave.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    handleSave() {
        if (this.props.onSave)
            this.props.onSave();
    }

    handleCancel() {
        if (this.props.onCancel)
            this.props.onCancel();
    }

    save(): void {
        
        const data = new FormData();
        if (this.state.computerId && this.state.computerId !== "")
            data.append("id", this.state.computerId);
        if (this.state.computerName && this.state.computerName !== "")
            data.append("name", this.state.computerName);
        if (this.state.computerDescription && this.state.computerDescription !== "")
            data.append("description", this.state.computerDescription);
        if (this.state.computerIPAddress && this.state.computerIPAddress !== "")
            data.append("ipAddress", this.state.computerIPAddress);
        if (this.state.computerMACAddress && this.state.computerMACAddress !== "")
            data.append("macAddress", this.state.computerMACAddress);
        if (this.state.computerUser && this.state.computerUser !== "")
            data.append("user", this.state.computerUser);

        console.log(`Adding/Create new computer : ${this.state.computerName}`);

        const options: RequestInit = {
            credentials: "include",
            method: "POST",
            body: data
        };

        fetch("api/computer", options)
            .then(response => {

                if (response.status !== 200) {
                    response.text().then(
                        data => this.setState({ errorMessage: data })
                    );
                    return;
                }

                this.handleSave();
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
                                        onChange={event => this.setState({ computerName: event.currentTarget.value })} />
                                </Col>
                            </FormGroup>
                            <FormGroup>
                                <Col sm={3}>Description : </Col>
                                <Col sm={9}>
                                    <FormControl type="text" placeholder="Description" value={this.state.computerDescription}
                                        onChange={event => this.setState({ computerDescription: event.currentTarget.value })} />
                                </Col>
                            </FormGroup>
                            <FormGroup>
                                <Col sm={3}>IP Address : </Col>
                                <Col sm={9}>
                                    <FormControl type="text" placeholder="IP Address" value={this.state.computerIPAddress}
                                        onChange={event => this.setState({ computerIPAddress: event.currentTarget.value })} />
                                </Col>
                            </FormGroup>
                            <FormGroup>
                                <Col sm={3}>MAC Address : </Col>
                                <Col sm={9}>
                                    <FormControl type="text" placeholder="MAC Address" value={this.state.computerMACAddress}
                                        onChange={event => this.setState({ computerMACAddress: event.currentTarget.value })} />
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
