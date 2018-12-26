import * as React from "react";
import { Button, ControlLabel, Form, FormControl, FormGroup, Modal, Col, Alert } from "react-bootstrap";
import * as Rouser from "./RouserTypes";

export class DeleteComputerCtrl extends React.Component<Rouser.IDeleteDialogCtrl, any> {

    constructor(props: Rouser.IDeleteDialogCtrl) {
        super(props);

        this.state = {
            errorMessage: null,
        };

        this.handleDelete = this.handleDelete.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    handleDelete() {
        if (this.props.onDelete)
            this.props.onDelete();
    }

    handleCancel() {
        if (this.props.onCancel)
            this.props.onCancel();
    }

    delete() {

        console.log(`Deleting Computer : ${this.props.computer.name}`);

        this.setState({ alert: null });

        const options: RequestInit = {
            credentials: "include",
            method: "DELETE"
        };

        fetch(`api/computer/${this.props.computer.id}`, options)
            .then(response => {

                if (response.status !== 200) {
                    response.text().then(
                        res => this.setState({ errorMessage: res })
                    );
                    return;
                }

                this.handleDelete();
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
                            Delete Computer
                        </Modal.Title>
                    </Modal.Header>

                    {this.state.errorMessage != null ? (
                        <Alert bsStyle="warning">{this.state.errorMessage}</Alert>
                    ) : (null)}

                    <Modal.Body>
                        Do you wish to delete computer <b>{this.props.computer.name}</b><br />
                        { this.props.computer.description }
                    </Modal.Body>

                    <Modal.Footer>
                        <Button bsStyle="primary" onClick={() => this.delete()}>Delete</Button>
                        <Button onClick={() => this.closeDialog()}>Cancel</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </div>);
    }
}
