import React, { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Avatar, Button } from "@nextui-org/react";

export default function PostCard({ content, name, username, files = [] }) {
    const [isFollowed, setIsFollowed] = useState(false);

    return (
        <Card className="mb-4">
            <CardHeader className="justify-between">
                <div className="flex gap-5">
                    <Avatar isBordered radius="full" size="md" src="https://nextui.org/avatars/avatar-1.png" />
                    <div className="flex flex-col gap-1 items-start justify-center">
                        {name && <h4 className="text-small font-semibold leading-none text-default-600">{name}</h4>}
                        <h5 className="text-small tracking-tight text-default-400">@{username}</h5>
                    </div>
                </div>
                <Button
                    className={isFollowed ? "bg-transparent text-foreground border-default-200" : ""}
                    color="primary"
                    radius="full"
                    size="sm"
                    variant={isFollowed ? "bordered" : "solid"}
                    onPress={() => setIsFollowed(!isFollowed)}
                >
                    {isFollowed ? "Unfollow" : "Follow"}
                </Button>
            </CardHeader>

            <CardBody className="px-3 py-0 text-small text-default-400">
                <p>{content}</p>
                {files.length > 0 && (
                    <div className="mt-4">
                        <h5 className="text-small font-semibold text-default-600">Archivos adjuntos:</h5>
                        <ul className="list-disc list-inside">
                            {files.map((file, index) => (
                                <li key={index} className="mt-2 flex items-center justify-between">
                                    <span>{file.file_name}</span>
                                    <Button
                                        as="a"
                                        href={file.file_path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        color="primary"
                                        size="sm"
                                        variant="ghost"
                                    >
                                        Descargar
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardBody>

            <CardFooter className="gap-3">
                <div className="flex gap-1">
                    <p className="font-semibold text-default-400 text-small">4</p>
                    <p className=" text-default-400 text-small">Following</p>
                </div>
                <div className="flex gap-1">
                    <p className="font-semibold text-default-400 text-small">97.1K</p>
                    <p className="text-default-400 text-small">Followers</p>
                </div>
            </CardFooter>
        </Card>
    );
}
