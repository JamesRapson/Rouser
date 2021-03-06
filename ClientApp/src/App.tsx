import * as React from "react";
import { Route } from "react-router";
import { Layout } from "./components/Layout";
import { Scripts } from "./components/Scripts";
import { ComputerWake } from "./components/ComputerWake";

export default class App extends React.Component<any, any> {

    constructor(props: any) {
        super(props);

    }
    
    render(): JSX.Element {
        return (
            <Layout>
                <Route exact path="/" render={() => <ComputerWake />} />
                <Route exact path="/computerwake" render={() => <ComputerWake />} />
                <Route exact path="/scripts" render={() => <Scripts />} />
            </Layout>);
    }
}
