import React, { useEffect, useState } from "react";
import {
    Center,
    Button,
    Link,
    VStack,
    FormLabel,
    Text,
    useToast,
} from "@chakra-ui/react";
import { FieldValues, useForm } from "react-hook-form";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";
import { useMutation } from "react-query";
import { useRouter } from "next/router";
import ErrorAnimation from "@components/lotties/Error/ErrorLottie";
import resetPassword from "src/resolvers/resetPassword";
import { yupResolver } from "@hookform/resolvers/yup";
import InputWithError from "src/forms/InputWithError";

const ResetPassword: React.FC = () => {
    const router = useRouter();
    const { token, callback } = router.query;
    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(resetPassword),
        criteriaMode: "all",
    });
    const [success, setSucces] = useState<boolean>(false);
    const [count, setCount] = useState<number>(10);
    const [captchaSuccess, setCaptchaSuccess] = useState<boolean>(false);
    const toast = useToast();

    const { mutate: verifyToken } = useMutation(
        (token: string) =>
            axios.post(`${process.env.NEXT_PUBLIC_SERVICE_URL}/verifycaptcha`, {
                token,
            }),
        {
            onSuccess: (data) => {
                console.log(data);
            },
        },
    );

    const { mutate, isLoading } = useMutation(
        (data: FieldValues) =>
            axios.post(
                `${process.env.NEXT_PUBLIC_SERVICE_URL}/resetpassword`,
                data,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            ),
        {
            onSuccess(data) {
                console.log(data);
                setSucces(true);
            },
            onError: (error) => {
                toast({
                    title: "Error",
                    description: "Internal server error",
                    status: "error",
                });
                console.log(error);
            },
        },
    );

    const onSubmit = (data: FieldValues) => {
        console.log(data);
        if (data.password !== data.confirmPassword) {
            return;
        }
        mutate({ password: data.password, token });
    };

    useEffect(() => {
        if (success && count > 0) {
            const interval = setInterval(() => {
                setCount((count) => count - 1);
            }, 1000);
            () => clearInterval(interval);
        }
    }, [success]);

    useEffect(() => {
        if (count === 0) {
            window.open(callback as string);
            window.close();
            setCount(10);
        }
    }, [count]);

    const onChange = (token: string | null) => {
        if (token) {
            verifyToken(token);

            setCaptchaSuccess(true);
        }
    };

    if (!token) return <ErrorAnimation />;

    return (
        <Center position="relative" minH="100vh" flexDirection="column">
            <Text fontSize={40}>Y TASK</Text>
            {!success ? (
                <VStack
                    shadow="md"
                    alignItems="flex-start"
                    p={10}
                    w="50%"
                    h="50%"
                    rounded={5}
                    spacing={4}
                    zIndex={2}
                    bg="white"
                >
                    <Text>
                        Choose a new password, it must be different from the
                        previous one.
                    </Text>
                    <FormLabel>Password</FormLabel>
                    <InputWithError
                        isEditable
                        errors={errors}
                        type="password"
                        register={register}
                        name="password"
                    />
                    <FormLabel>Confirm password</FormLabel>
                    <InputWithError
                        isEditable
                        errors={errors}
                        type="password"
                        register={register}
                        name="confirmPassword"
                    />
                    <ReCAPTCHA
                        onErrored={() => console.log("error")}
                        sitekey={
                            process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY as string
                        }
                        onChange={onChange}
                    />
                    <Button
                        isDisabled={!captchaSuccess}
                        isLoading={isLoading}
                        onClick={handleSubmit(onSubmit)}
                        w="full"
                        color="white"
                        bg="orange"
                    >
                        SUBMIT
                    </Button>
                </VStack>
            ) : (
                <Text w="full" p={5} textAlign="center">
                    Your password has been successfully changed you will be
                    redirect in {count} seconds or click{" "}
                    <Link
                        textDecoration="underline"
                        color="blue.500"
                        href={callback as string}
                    >
                        HERE
                    </Link>{" "}
                    to return to your website
                </Text>
            )}
        </Center>
    );
};

export default ResetPassword;
