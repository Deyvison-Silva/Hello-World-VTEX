import React, { Component, Fragment } from "react";
import { FormButton } from "./FormButton";

export class FormMessage extends Component {
    render() {
        return (
            <Fragment>
                {this.props.stateForm === "success" && (
                    <span className="message-success">{this.props.messageSuccess}</span>
                )}

                {this.props.stateForm === "error" && (
                    <div className="error">
                        <h3>{this.props.messageError.title}</h3>
                        <p>{this.props.messageError.content}</p>
                        <FormButton {...this.props} />
                    </div>
                )}
            </Fragment>
        );
    }
}
