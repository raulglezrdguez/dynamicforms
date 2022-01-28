import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "./components/AsyncComponent";
import AppliedRoute from "./components/AppliedRoute";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";

const AsyncHome = asyncComponent(() => import("./containers/Home"));
const AsyncLogin = asyncComponent(() => import("./containers/Login"));
const AsyncClient = asyncComponent(() => import("./containers/Client"));
const AsyncAdmon = asyncComponent(() => import("./containers/Admon"));
const AsyncAdmonForms = asyncComponent(() => import("./containers/AdmonForms"));
const AsyncAdmonModules = asyncComponent(() => import("./containers/AdmonModules"));
const AsyncAdmonUsers = asyncComponent(() => import("./containers/AdmonUsers"));
const AsyncReport = asyncComponent(() => import("./containers/Report"));

const AsyncNotFound = asyncComponent(() => import("./components/NotFound"));

export default ({ childProps }) =>
  <Switch>
    <AppliedRoute path="/" exact component={AsyncHome} props={childProps} />
    <UnauthenticatedRoute path="/login" exact component={AsyncLogin} props={childProps} />
    <AuthenticatedRoute path="/client" exact component={AsyncClient} props={childProps} />
    <AuthenticatedRoute path="/adm" exact component={AsyncAdmon} props={childProps} />
    <AuthenticatedRoute path="/admforms" exact component={AsyncAdmonForms} props={childProps} />
    <AuthenticatedRoute path="/admmodules" exact component={AsyncAdmonModules} props={childProps} />
    <AuthenticatedRoute path="/admusers" exact component={AsyncAdmonUsers} props={childProps} />
    <UnauthenticatedRoute path="/report" exact component={AsyncReport} props={childProps} />
    { /* Finally, catch all unmatched routes */ }
    <Route component={AsyncNotFound} />
  </Switch>;
