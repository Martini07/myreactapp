// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, {useEffect, useState, Fragment} from "react";
import {Auth, Hub} from "aws-amplify";
import {Container} from "react-bootstrap";
import { Amplify } from "aws-amplify";
import Navigation from "./components/Navigation.js";
import FederatedSignIn from "./components/FederatedSignIn.js";
import MainRequest from "./components/MainRequest.js";
import "./App.css";

Amplify.configure({
  Auth: {
    region: "eu-west-1",
    userPoolId: "eu-west-1_tPV5Iolro",
    userPoolWebClientId: "60a1thkpk9oidur587npi9l9f6",
    oauth: {
      domain: "https://ffmarti-domain.auth.eu-west-1.amazoncognito.com",
      scope: ["email", "openid", "aws.cognito.signin.user.admin", "profile"],
      redirectSignIn: "https://main.d1dr6t0vuawcp3.amplifyapp.com/",
      redirectSignOut: "https://main.d1dr6t0vuawcp3.amplifyapp.com/",
      responseType: "code"
    }
  },
  API: {
    endpoints: [
      {
        name: "HelloAPI",
        endpoint: "https://7u9sv5rx7k.execute-api.eu-west-1.amazonaws.com/dev"
      }
    ]
  }
});

const federatedIdName =
  "Azure-IDP";

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    Hub.listen("auth", ({payload: {event, data}}) => {
      switch (event) {
        case "signIn":
        case "cognitoHostedUI":
          setToken("grating...");
          getToken().then(userToken => setToken(userToken.idToken.jwtToken));
          break;
        case "signOut":
          setToken(null);
          break;
        case "signIn_failure":
        case "cognitoHostedUI_failure":
          console.log("Sign in failure", data);
          break;
        default:
          break;
      }
    });
  }, []);

  function getToken() {
    return Auth.currentSession()
      .then(session => session)
      .catch(err => console.log(err));
  }

  return (
    <Fragment>
      <Navigation token={token} />
      <Container fluid>
        <br />
        {token ? (
          <MainRequest token={token} />
        ) : (
          <FederatedSignIn federatedIdName={federatedIdName} />
        )}
      </Container>
    </Fragment>
  );
}

export default App;
