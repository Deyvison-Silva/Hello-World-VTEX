import "./index.scss";

export const Login = () => {
    $(document).on("click", "body.login #vtexIdUI-form-classic-login > div.modal-header > button.close", function() {
        window.location.href = "/";
    });
};
