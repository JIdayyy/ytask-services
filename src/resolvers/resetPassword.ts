/* eslint-disable no-useless-escape */
import * as yup from "yup";

const resetPassword = yup
    .object()
    .shape({
        password: yup
            .string()
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
                "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character",
            )
            .required(),
        confirmPassword: yup
            .string()
            .oneOf([yup.ref("password"), null], "Passwords must match"),
    })
    .required();

export default resetPassword;
