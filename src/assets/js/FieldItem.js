import React, { Component } from "react";
import InputMask from "react-input-mask";

export class FieldItem extends Component {
    render() {
        return (
            <div className={`field ${this.props.itemName}`}>
                <label htmlFor={this.props.itemName}>{this.props.itemLabel}</label>
                <InputMask
                    id={this.props.itemName}
                    placeholder={this.props.itemLabel}
                    value={this.props.values.itemName}
                    onChange={this.props.handleChange}
                    onBlur={this.props.handleBlur}
                    className={
                        this.props.errors[this.props.itemName] && this.props.touched[this.props.itemName]
                            ? "text-input error"
                            : "text-input"
                    }
                />
                {this.props.errors[this.props.itemName] && (
                    <span className="input-error">{this.props.errors[this.props.itemName]}</span>
                )}
            </div>
        );
    }
}
