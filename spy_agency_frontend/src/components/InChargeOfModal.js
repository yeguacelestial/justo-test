import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";

const people = [
    { name: "Lindsay Walton", title: "Front-end Developer", email: "lindsay.walton@example.com", role: "Member" },
    { name: "Lindsay Walton", title: "Front-end Developer", email: "lindsay.walton@example.com", role: "Member" },
    { name: "Lindsay Walton", title: "Front-end Developer", email: "lindsay.walton@example.com", role: "Member" },
    { name: "Lindsay Walton", title: "Front-end Developer", email: "lindsay.walton@example.com", role: "Member" },
    { name: "Lindsay Walton", title: "Front-end Developer", email: "lindsay.walton@example.com", role: "Member" },
    { name: "Lindsay Walton", title: "Front-end Developer", email: "lindsay.walton@example.com", role: "Member" },
    { name: "Lindsay Walton", title: "Front-end Developer", email: "lindsay.walton@example.com", role: "Member" },
    { name: "Lindsay Walton", title: "Front-end Developer", email: "lindsay.walton@example.com", role: "Member" },
    { name: "Lindsay Walton", title: "Front-end Developer", email: "lindsay.walton@example.com", role: "Member" },
    { name: "Lindsay Walton", title: "Front-end Developer", email: "lindsay.walton@example.com", role: "Member" },
    { name: "Lindsay Walton", title: "Front-end Developer", email: "lindsay.walton@example.com", role: "Member" },
    { name: "Lindsay Walton", title: "Front-end Developer", email: "lindsay.walton@example.com", role: "Member" },
    { name: "Lindsay Walton", title: "Front-end Developer", email: "lindsay.walton@example.com", role: "Member" },
    // More people...
];

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function InChargeOfModal({ hitmanId, isOpen, closeModal }) {
    const cancelButtonRef = useRef(null);

    const [modalOpen, setModalOpen] = useState(isOpen);

    useEffect(() => {
        setModalOpen(isOpen)
    }, [isOpen])

    const handleOutsideClick = (event) => {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    };

    return (
        <Transition.Root show={modalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="backdrop-blur-sm fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div onClick={handleOutsideClick} className="fixed inset-0 flex items-center justify-center">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="relative max-w-3xl w-full bg-white shadow-xl rounded-lg p-4 sm:p-6">
                            <div className="overflow-x-auto lg:overflow-x-hidden max-h-[20rem] mt-8">
                                <table className="min-w-full border-separate border-spacing-0">
                                    <thead className="sticky top-0 bg-white bg-opacity-75 z-10">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="border-b border-gray-300 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                                            >
                                                Name
                                            </th>
                                            <th
                                                scope="col"
                                                className="hidden border-b border-gray-300 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:table-cell"
                                            >
                                                Email
                                            </th>
                                            <th
                                                scope="col"
                                                className="hidden border-b border-gray-300 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                                            >
                                                Description
                                            </th>
                                            <th
                                                scope="col"
                                                className="border-b border-gray-300 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                            >
                                                Status
                                            </th>
                                            <th
                                                scope="col"
                                                className="border-b border-gray-300 py-3.5 pl-3 pr-4 backdrop-blur backdrop-filter sm:pr-6 lg:pr-8"
                                            >
                                                <span className="sr-only">Edit</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {people.map((person, personIdx) => (
                                            <tr key={person.email}>
                                                <td
                                                    className={classNames(
                                                        "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8"
                                                    )}
                                                >
                                                    {person.name}
                                                </td>
                                                <td
                                                    className={classNames(
                                                        "hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell"
                                                    )}
                                                >
                                                    {person.title}
                                                </td>
                                                <td
                                                    className={classNames(
                                                        "hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 lg:table-cell"
                                                    )}
                                                >
                                                    {person.email}
                                                </td>
                                                <td className={classNames("whitespace-nowrap px-3 py-4 text-sm text-gray-500")}>
                                                    {person.role}
                                                </td>
                                                <td
                                                    className={classNames("relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium")}
                                                >
                                                    <a href="#" className="text-indigo-600 hover:text-indigo-900">
                                                        Edit<span className="sr-only">, {person.name}</span>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
