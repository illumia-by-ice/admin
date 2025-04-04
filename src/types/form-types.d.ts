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

interface IVerifyPasswordFormInput {
  email: string;
  newPassword: string;
  otp: string;
}

interface ICreatePropertyFormInput {
  title: string;
  description: string;
  price: string;
  bedrooms?: string;
  bathrooms?: string;
  yearBuilt?: string;
  squareFeet?: string;
  address?: string;
  // status?: string;
  listingType: string;
  tags: string;
  images: any;
  videoTour?:string;
  videoTour?: any;
}

interface ICreateAdFormInput {
  title?: string;
  description?: string;
  link: string;
  image: any;
}

interface ISendMessageFormInput {
  to: string;
  subject: string;
  message: string;
}