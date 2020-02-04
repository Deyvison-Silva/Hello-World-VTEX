import React, { Component } from "react";

export class FormButton extends Component {
    render() {
        return (
            <div className="actions">
                {(this.props.typeButton === "submit" && (
                    <button type="submit" disabled={this.props.isSubmitting}>
                        Cadastrar
                    </button>
                )) || (
                    <button className="btn-back" onClick={e => this.props.updateState("normal")}>
                        Voltar
                    </button>
                )}
            </div>
        );
    }
}
