interface IRegisterFormInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

interface ILoginFormInput {
    email: string;
    password: string;
}

interface IForgotPasswordFormInput {
    email: string;
}

interface IVerifyPasswordFormInput{
    email: string;
    newPassword: string;
    otp: string;
}