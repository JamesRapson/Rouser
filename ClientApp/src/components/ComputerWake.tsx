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

        const computersList: Array<Rouser.ComputerDetails> = null;
        const recentComputersList: Array<Rouser.ComputerDetails> = null;
        const selectedComputers: Array<string> = [];
        const autoOpenRdpFile = CookiesUtility.getOpenRdpFileValue();

        this.state = {
            computersList,
            recentComputersList,
            selectedComputers,
            filterStr: "",
            showAddComputerDialog: false,
            editComputer: null,
            autoOpenRdpFile,
        };

        this.loadRecentComputers();
    }

    loadComputersList(url: string): Promise<Array<Rouser.ComputerDetails>> {

        const options: RequestInit = {
            credentials: "include",
            method: "GET"
        };

        return fetch(url, options)
            .then(response => {

                if (response.status !== 200) {
                    response.text().then(data => this.showErrorMessage(data));
                    return [];
                }
                return response.json();
            })
            .catch(err => {
                this.showErrorMessage(err);
            });
    }

    loadRecentComputers(): void {

        this.loadComputersList(`api/computer/recent`)
            .then((list: Array<Rouser.ComputerDetails>) => {
                this.setState(
                    {
                        recentComputersList: list,
                    }
                );
            });

    }

    loadFilteredComputers(filterStr: string): void {

        this.loadComputersList(`api/computer/list/${filterStr}`)
            .then((list: Array<Rouser.ComputerDetails>) => {
                this.setState(
                    {
                        computersList: list,
                    }
                );
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

        if (this.state.autoOpenRdpFile) {
            const element = document.createElement("a");
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
        if (this.state.computersList)
            this.loadFilteredComputers(this.state.filterStr);
    }

    onAfterEditComputer(computer: Rouser.ComputerDetails) {

        this.showInformationMessage(`Computer ${computer.name} edited`);
        this.setState({
            editComputer: false,
        });

        CookiesUtility.addRecentComputer(computer.name);
        this.loadRecentComputers();
    }
    
    onAfterDeleteComputer(computer: Rouser.ComputerDetails) {

        this.showInformationMessage(`Computer ${this.state.deleteComputer.name} deleted`);
        CookiesUtility.removeRecentComputer(computer.name);
        this.setState({
            deleteComputer: null
        });

        this.loadRecentComputers();
        if (this.state.computersList)
            this.loadFilteredComputers(this.state.filterStr);
    }

    onCancelCreateEditDeleteComputer() {
        this.setState({
            showAddComputerDialog: false,
            editComputer: false,
            deleteComputer: null
        });
    }

    editComputer(computer: Rouser.ComputerDetails, event: any) {
        event.preventDefault();
        this.setState({ editComputer: computer });
    }

    deleteComputer(computer: Rouser.ComputerDetails, event: any) {
        event.preventDefault();
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
        CookiesUtility.setOpenRdpFileValue(val);
        this.setState({ autoOpenRdpFile: val });
    }

    renderComputersList(computersList: Array<Rouser.ComputerDetails>): JSX.Element {

        if (!computersList) {
            return null;
        }

        return (
            <table className="computerlist-table">
                <tbody>
                    {computersList.map((computer: Rouser.ComputerDetails) =>
                        <tr key={computer.id} className="computerlist-row">
                            <td className="computerlist-buttonCol">
                                <Button onClick={() => this.wakeComputer(computer)}>
                                    <Glyphicon glyph="star"/> Wake
                                </Button>
                            </td>
                            <td className="computerlist-nameCol">
                                <a href="#" onClick={(event) => this.editComputer(computer, event)}>
                                    {computer.name}
                                </a>
                            </td>
                            <td className="computerlist-col">
                                {computer.description}
                            </td>
                            <td className="computerlist-col hidden-xs">
                                {computer.user}
                            </td>
                            <td className="computerlist-col hidden-sm hidden-xs">
                                IP {computer.networkAdapters[0].ipAddress}
                            </td>
                            <td className="computerlist-buttonCol">
                                <Button onClick={(event) => this.deleteComputer(computer, event)}>
                                    <Glyphicon glyph="remove"/>
                                </Button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>);
    }

    renderDialogs(): JSX.Element {

        if (this.state.showAddComputerDialog) {

            return (
                <EditComputerCtrl
                    mode={Rouser.EditComputerCtrlModeEnum.Create}
                    computer={null}
                    onSave={(computer: Rouser.ComputerDetails) => this.onAfterCreateComputer(computer)}
                    onCancel={() => this.onCancelCreateEditDeleteComputer()}>
                </EditComputerCtrl>);

        } else if (this.state.editComputer) {

            return (
                <EditComputerCtrl
                    mode={Rouser.EditComputerCtrlModeEnum.Edit}
                    computer={this.state.editComputer}
                    onSave={(computer: Rouser.ComputerDetails) => this.onAfterEditComputer(computer)}
                    onCancel={() => this.onCancelCreateEditDeleteComputer()}>
                </EditComputerCtrl>);

        } else if (this.state.deleteComputer) {

            return (
                <DeleteComputerCtrl
                    computer={this.state.deleteComputer}
                    onDelete={(computer: Rouser.ComputerDetails) => this.onAfterDeleteComputer(computer)}
                    onCancel={() => this.onCancelCreateEditDeleteComputer()}>
                </DeleteComputerCtrl>);
        }

        return null;
    }

    render(): JSX.Element {

        return (
            <div>
                <div className="title-bar">
                    <div>
                        <h2>Computers</h2>
                    </div>
                    <div className="title-bar-rhs">
                        <Button onClick={() => this.setState({ showAddComputerDialog: true })}>
                            <Glyphicon glyph="plus" /> Add Computer
                        </Button>
                        <Checkbox
                            checked={this.state.autoOpenRdpFile}
                            onChange={(event: any) => this.setOpenRdpFile(event.currentTarget.checked)}
                            >
                            Open RDP on Wake
                        </Checkbox>
                    </div>
                </div>

                {this.renderDialogs()}

                {this.state.alert != null ? (
                    <Alert bsStyle={this.state.alert.style}>{this.state.alert.message}</Alert>
                ) : (null)}

                {this.state.recentComputersList && this.state.recentComputersList.length > 0 ?
                    <div className="recentList-header">
                        <h4>Recent</h4>
                        <a href="#" onClick={() => this.clearRecentComputersList()}
                            className="recentList-clear"
                            title="Clear the list of recent computers">
                            Clear recent
                        </a>
                    </div> : <div></div>}

                {this.renderComputersList(this.state.recentComputersList)}

                <div className="filterForm">
                    <Form inline>
                        <FormGroup>
                            <FormControl type="text" placeholder="Search" value={this.state.filterStr}
                                onChange={(event: any) => this.setState({ filterStr: event.currentTarget.value })} />
                        </FormGroup>{" "}
                        <FormGroup>
                            <Button onClick={() => this.loadFilteredComputers(this.state.filterStr)}>
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