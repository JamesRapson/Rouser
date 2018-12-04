import * as React from "react";
import { Table, Button, ControlLabel, Form, FormControl, FormGroup, Modal, Col, Alert, Glyphicon } from "react-bootstrap";
import { EditComputerCtrl } from "./EditComputerCtrl";
import * as Rouser from "./RouserTypes";

export class ComputerWake extends React.Component<any, any> {

    constructor(props: any) {
        super(props);

        const computersList: Array<Rouser.ComputerDetails> = [];
        const selectedComputers: Array<string> = [];

        this.state = {
            computersList,
            selectedComputers,
            filterStr: "",
            showAddComputerDialog: false,
            editComputer: null
        };

        this.loadComputers(this.state.filterStr);
    }

    loadComputers(filterStr: string): void {

        const options: RequestInit = {
            credentials: "include",
            method: "GET"
        };

        fetch(`api/computer/list/${filterStr}`, options)
            .then(response => {

                if (response.status !== 200) {
                    response.text().then(data => this.showErrorMessage(data));
                    return [];
                }
                return response.json();
            })
            .then(data => {
                this.setState(
                    {
                        computersList: data,
                    }
                );
            })
            .catch(err => {
                this.showErrorMessage(err);
            });
    }

    wakeComputer(computer: Rouser.ComputerDetails): void {

        console.log(`Waking Computer : ${computer.name}`);

        this.setState({ alert: null });

        const options: RequestInit = {
            credentials: "include",
            method: "GET"
        };

        fetch(`api/computer/wake/${computer.id}`, options)
            .then(response => {

                if (response.status !== 200) {
                    response.text().then(data => this.showErrorMessage(data));
                    return;
                }

                this.showInformationMessage(`Wakeup command sent to computer : ${computer.name}`);
            })
            .catch(err => {
                this.showInformationMessage(err);
            });
    }

    onAfterEditCreateComputer() {

        this.setState({
            showAddComputerDialog: false,
            editComputer: null
        });

        this.loadComputers(this.state.filterStr);
    }

    editComputer(computer: Rouser.ComputerDetails) {
        this.setState({ editComputer: computer });
    }

    deleteComputer(computer: Rouser.ComputerDetails) {

        console.log(`Deleting Computer : ${computer.name}`);

        this.setState({ alert: null });

        const options: RequestInit = {
            credentials: "include",
            method: "DELETE"
        };

        fetch(`api/computer/${computer.id}`, options)
            .then(response => {

                if (response.status !== 200) {
                    response.text().then(data => this.showErrorMessage(data));
                    return;
                }

                this.showInformationMessage(`Computer '${computer.name}' deleted`);

                this.loadComputers(this.state.filterStr);
            })
            .catch(err => {
                this.showInformationMessage(err);
            });
    }

    showErrorMessage(message: string): void {

        this.setState({
            alert: {
                message,
                style: "danger"
            }
        });
    }

    showInformationMessage(message: string): void {

        this.setState({
            alert: {
                message,
                style: "info"
            }
        });
    }

    render(): JSX.Element {

        let dialogHtml: JSX.Element = null;
        if (this.state.showAddComputerDialog) {
            dialogHtml = (
                <EditComputerCtrl
                    mode={Rouser.EditComputerCtrlModeEnum.Create}
                    computer={null}
                    onSave={() => this.onAfterEditCreateComputer()}
                    onCancel={() => this.onAfterEditCreateComputer()}>
                </EditComputerCtrl>);
        } else if (this.state.editComputer) {
            dialogHtml = (
                <EditComputerCtrl
                    mode={Rouser.EditComputerCtrlModeEnum.Edit}
                    computer={this.state.editComputer}
                    onSave={() => this.onAfterEditCreateComputer()}
                    onCancel={() => this.onAfterEditCreateComputer()}>
                </EditComputerCtrl>);
        }

        return (
            <div>
                <h1>Computers</h1>

                {dialogHtml}

                <Form horizontal>
                    <FormGroup>
                        <Col sm={1}>Filter : </Col>
                        <Col sm={3}>
                            <FormControl type="text" placeholder="Search" value={this.state.filterStr}
                                onChange={event => this.setState({ filterStr: event.currentTarget.value })} />
                        </Col>
                        <Col sm={1}>
                            <Button onClick={() => this.loadComputers(this.state.filterStr)}>
                                <Glyphicon glyph="filter" /> Filter
                            </Button>
                        </Col>
                        <Col sm={1}>
                            <Button onClick={() => this.setState({ showAddComputerDialog: true })}>
                                <Glyphicon glyph="plus" /> Add Computer
                            </Button>
                        </Col>
                        <Col sm={3}></Col>
                    </FormGroup>
                </Form>

                {this.state.alert != null ? (
                    <Alert bsStyle={this.state.alert.style}>{this.state.alert.message}</Alert>
                ) : (null)}

                <Table responsive>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>IP Address</th>
                            <th>MAC Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.computersList.map(computer =>
                            <tr key={computer.Name}>
                                <td>
                                    <Button onClick={() => this.wakeComputer(computer)}>
                                        <Glyphicon glyph="star" /> Wake
                                </Button>
                                </td>
                                <td>
                                    <a href="#" onClick={() => this.editComputer(computer)}>
                                        {computer.name}
                                    </a>
                                </td>
                                <td>{computer.description}</td>
                                <td>{computer.ipAddress}</td>
                                <td>{computer.macAddress}</td>
                                <td>
                                    <Button onClick={() => this.deleteComputer(computer)}>
                                        <Glyphicon glyph="remove" />
                                    </Button>
                                </td>
                            </tr>)}
                    </tbody>
                </Table>
            </div>
        );
    }
}