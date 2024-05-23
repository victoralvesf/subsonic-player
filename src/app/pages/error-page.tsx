import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import Error404Icon from "../components/icons/error-404-icon";

export default function ErrorPage() {
  return (
    <div className="grid grid-cols-2 w-screen h-screen justify-center items-center">
      <Error404Icon className="p-8 ml-auto" width={400} />
      <div className="flex flex-col justify-center items-center p-8 mr-auto text-left">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Oops!
        </h1>

        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Page not found!
        </p>

        <Link to={'/'}>
          <Button className="mt-6">Back to home</Button>
        </Link>
      </div>
    </div>
  );
}