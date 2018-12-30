import * as React from "react";
import {
    Alert, Panel, Button, Grid, Col, Row, Form, FormControl,
    ControlLabel, FormGroup, Glyphicon, ListGroup, ListGroupItem,
    Checkbox
} from "react-bootstrap";
import { CookiesUtility} from "./CookiesUtility"
import { DeleteComputerCtrl } from "./DeleteComputerCtrl";
import { EditComputerCtrl } from "./EditComputerCtrl";
import * as Rouser from "./RouserTypes";

export class ComputerWake extends React.Component<any, any> {

    constructor(props: any) {
        super(props);

        const computersList: Array<Rouser.ComputerDetails> = [];
        const recentComputersList: Array<Rouser.ComputerDetails> = [];
        const selectedComputers: Array<string> = [];

        let autoOpen = CookiesUtility.getCookie("auto-open-rdpFile");

        this.state = {
            computersList,
            recentComputersList,
            selectedComputers,
            filterStr: "",
            showAddComputerDialog: false,
            editComputer: null,
            autoOpenRdpFile: (autoOpen === "true")
        };

        this.loadRecentComputers();
    }

    loadRecentComputers(): void {

        const options: RequestInit = {
            credentials: "include",
            method: "GET"
        };

        fetch(`api/computer/recent`, options)
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
                        recentComputersList: data,
                    }
                );
            })
            .catch(err => {
                this.showErrorMessage(err);
            });
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
        CookiesUtility.addRecentComputer(computer.name);

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
                this.loadRecentComputers();
                this.downloadRdpFile(computer);
            })
            .catch(err => {
                this.showInformationMessage(err);
            });
    }

    downloadRdpFile(computer: Rouser.ComputerDetails): void {

        let val = CookiesUtility.getCookie("auto-open-rdpFile");
        if (val === "true") {
            let element: HTMLAnchorElement = document.createElement("a");
            element.setAttribute("href", `api/computer/getrdpfile/${computer.id}`);
            element.setAttribute("download", `${computer.name}.rdp`);
            element.style.display = "none";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
    }

    onAfterCreateComputer(computer: Rouser.ComputerDetails) {

        this.showInformationMessage(`Computer ${computer.name} created`);
        this.setState({
            showAddComputerDialog: false,
        });

        CookiesUtility.addRecentComputer(computer.name);
        this.loadRecentComputers();
    }

    onAfterEditComputer(computer: Rouser.ComputerDetails) {

        this.showInformationMessage(`Computer ${computer.name} edited`);

        this.setState({
            editComputer: false,
        });

        CookiesUtility.addRecentComputer(computer.name);
        this.loadRecentComputers();
    }
    
    onAfterDeleteComputer() {
        this.showInformationMessage(`Computer ${this.state.deleteComputer.name} deleted`);
        this.setState({
            deleteComputer: null
        });

        this.loadRecentComputers();
    }

    onCancelCreateEditDeleteComputer() {
        this.setState({
            showAddComputerDialog: false,
            editComputer: false,
            deleteComputer: null
        });
    }

    editComputer(computer: Rouser.ComputerDetails) {
        this.setState({ editComputer: computer });
    }

    deleteComputer(computer: Rouser.ComputerDetails) {
        this.setState({ deleteComputer: computer });
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

    clearRecentComputersList() : void {
        console.log("Clearing recent computers list");
        CookiesUtility.clearRecentComputersList();
        this.loadRecentComputers();
    }

    setOpenRdpFile(val: boolean): void {
        CookiesUtility.setCookie("auto-open-rdpFile", val.toString(), 100);
        this.setState({ autoOpenRdpFile: val });
    }

    renderComputersList(computersList: Array<Rouser.ComputerDetails>): JSX.Element {

        return (
            <table className="computerlist-table">
                <tbody>
                    {computersList.map((computer: Rouser.ComputerDetails) =>

                        <tr key={computer.id} className="computerlist-row">
                        <td className="computerlist-buttonCol">
                            <Button onClick={() => this.wakeComputer(computer)}>
                                <Glyphicon glyph="star" /> Wake
                            </Button>
                        </td>
                        <td className="computerlist-nameCol">
                            <a href="#" onClick={() => this.editComputer(computer)} >
                                {computer.name}
                            </a>
                        </td>
                        <td className="computerlist-col">
                            {computer.description}
                        </td>
                        <td className="computerlist-col">
                            IP {computer.networkAdapters[0].ipAddress}
                        </td>
                        <td className="computerlist-buttonCol">
                            <Button onClick={() => this.deleteComputer(computer)}>
                                <Glyphicon glyph="remove" />
                            </Button>
                        </td>
                    </tr>
                    )}
                </tbody>
            </table>);
    }

    render(): JSX.Element {

        let dialogHtml: JSX.Element = null;
        if (this.state.showAddComputerDialog) {

            dialogHtml = (
                <EditComputerCtrl
                    mode={Rouser.EditComputerCtrlModeEnum.Create}
                    computer={null}
                    onSave={(computer: Rouser.ComputerDetails) => this.onAfterCreateComputer(computer)}
                    onCancel={() => this.onCancelCreateEditDeleteComputer()}>
                </EditComputerCtrl>);

        } else if (this.state.editComputer) {

            dialogHtml = (
                <EditComputerCtrl
                    mode={Rouser.EditComputerCtrlModeEnum.Edit}
                    computer={this.state.editComputer}
                    onSave={(computer: Rouser.ComputerDetails) => this.onAfterEditComputer(computer)}
                    onCancel={() => this.onCancelCreateEditDeleteComputer()}>
                </EditComputerCtrl>);

        } else if (this.state.deleteComputer) {

            dialogHtml = (
                <DeleteComputerCtrl
                    computer={this.state.deleteComputer}
                    onDelete={() => this.onAfterDeleteComputer()}
                    onCancel={() => this.onCancelCreateEditDeleteComputer()}>
                </DeleteComputerCtrl>);
        }

        return (
            <div>
                <div className="title">
                    <h2>Computers</h2>
                    <Checkbox
                        checked={this.state.autoOpenRdpFile}
                        onClick={(event: any) => this.setOpenRdpFile(event.currentTarget.checked)}
                        className="openRdpCheckbox">
                        Open RDP on Wake
                    </Checkbox>

                    <Button onClick={() => this.setState({ showAddComputerDialog: true })} className="addComputerButton">
                        <Glyphicon glyph="plus" /> Add Computer
                    </Button>
                </div>

                {dialogHtml}

                {this.state.alert != null ? (
                    <Alert bsStyle={this.state.alert.style}>{this.state.alert.message}</Alert>
                ) : (null)}

                {this.state.recentComputersList.length > 0 ?
                    <div className="recentList-header">
                        <h4>Recent</h4>
                        <a href="#" onClick={() => this.clearRecentComputersList()}
                            className="recentList-clear"
                            title="Clear the list of recent computers">
                            Clear recent
                        </a>
                    </div> : <div></div>}

                {this.renderComputersList(this.state.recentComputersList)}

                <h4>Computers</h4>
                <div className="filterForm">
                    <Form inline>
                        <FormGroup>
                            <ControlLabel>Filter </ControlLabel>
                            <FormControl type="text" placeholder="Search" value={this.state.filterStr}
                                onChange={(event: any) => this.setState({ filterStr: event.currentTarget.value })} />
                        </FormGroup>{" "}
                        <FormGroup>
                            <Button onClick={() => this.loadComputers(this.state.filterStr)}>
                                <Glyphicon glyph="filter" /> Filter
                            </Button>
                        </FormGroup>
                    </Form>
                </div>

                {this.renderComputersList(this.state.computersList)}
                
            </div>
        );
    }
}