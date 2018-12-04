import * as React from "react";
import { Route } from "react-router";
import { Layout } from "./components/Layout";
import { About } from "./components/About";
import { ComputerWake } from "./components/ComputerWake";

export default class App extends React.Component<any, any> {

    constructor(props: any) {
        super(props);

    }
    
    render(): JSX.Element {
        return (
            <Layout>
                <Route exact path="/computerwake" render={() => <ComputerWake />} />
                <Route exact path="/about" render={() => <About />} />
            </Layout>);
    }
}
