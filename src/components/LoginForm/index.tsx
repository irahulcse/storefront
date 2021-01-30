// @ts-nocheck
import "./scss/index.scss";

import * as React from "react";
import FacebookLogin from "react-facebook-login";
import GoogleLogin from "react-google-login";
import { useSignIn } from "@sdk/react";
import { maybe } from "@utils/misc";
import gql from "graphql-tag";
import { Button, Form, TextField } from "..";
import { setAuthToken } from "../../@sdk/auth.ts";

export const authEvent = new Event("auth");

interface ILoginForm {
  hide?: () => void;
}

const LoginForm: React.FC<ILoginForm> = ({ hide }) => {
  const [signIn, { loading, error }] = useSignIn();

  const handleOnSubmit = async (evt, { email, password }) => {
    evt.preventDefault();
    const authenticated = await signIn({ email, password });
    if (authenticated && hide) {
      hide();
    }
  };

  async function responseFacebook(response) {
    const checkQuery = `
    mutation{
      oauthTokenCreate(backend:FACEBOOK, accessToken:"${response.accessToken}"){
        token, 
        user{id, email}       
        errors{message}
      }
    }
    `;
    fetch(process.env.API_URI, {
      method: "post",
      headers: {
        "Content-type": "application/graphql",
      },
      body: checkQuery,
    })
      .then(response => response.json())
      .then(data => {
        setAuthToken(data.data.oauthTokenCreate.token);
        hide();
      })
      .catch(error => console.log(error));
  }

  function responseGoogle(response) {
    const checkQuery = `
    mutation{
      oauthTokenCreate(backend:GOOGLE_OAUTH2, accessToken:"${response.accessToken}"){
        token,  
        user{id, email}                 
        errors{message}
      }
    }
    `;
    fetch(process.env.API_URI, {
      method: "post",
      headers: {
        "Content-type": "application/graphql",
      },
      body: checkQuery,
    })
      .then(response => response.json())
      .then(data => {
        setAuthToken(data.data.oauthTokenCreate.token);
        hide();
      })
      .catch(error => console.log(error));
  }

  return (
    <div className="login-form">
      <Form
        errors={maybe(() => error.extraInfo.userInputErrors, [])}
        onSubmit={handleOnSubmit}
      >
        <TextField
          name="email"
          autoComplete="email"
          label="Email Address"
          type="email"
          required
        />
        <TextField
          name="password"
          autoComplete="password"
          label="Password"
          type="password"
          required
        />
        <div className="login-form__button">
          <Button type="submit" {...(loading && { disabled: true })}>
            {loading ? "Loading" : "Sign in"}
          </Button>
        </div>
      </Form>
      <div
        style={{
          marginTop: 10,
          //marginLeft: 80,
          padding: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <FacebookLogin
          style={{ marginTop: 10, marginBottom: 10 }}
          appId="421541632073968"
          autoLoad={true}
          size="medium"
          fields="name,email,picture"
          callback={responseFacebook}
        />
        <br />
        <GoogleLogin
          clientId="700486593925-qkqhiofi7vs5btf49r9v2jgqhg12i42d.apps.googleusercontent.com"
          buttonText="Login with Google"
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          cookiePolicy={"single_host_origin"}
        />
      </div>
    </div>
  );
};

export default LoginForm;
