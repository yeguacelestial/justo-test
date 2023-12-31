import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import EmptyState from "./EmptyState";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function InChargeOfModal({ hitmanId, isOpen, closeModal }) {
    const [authToken, setAuthToken] = useState('')
    const [error, setError] = useState('')
    const [hitmen, setHitmen] = useState([])

    const cancelButtonRef = useRef(null);

    const [modalOpen, setModalOpen] = useState(isOpen);

    const handleHitmen = async (authToken) => {
        const url = `http://0.0.0.0:8000/api/hitmen/${hitmanId}/in_charge_of/`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': 'Token ' + authToken,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setHitmen(data)
            } else {
                const errorData = await response.json();
                const errorMessage = errorData?.non_field_errors[0] || 'Unknown error occurred';
                setError(errorMessage);
            }
        } catch (error) {
            console.error(error)
            setError('Hitmen: An error occurred. Please try again.');
        }
    }

    const handleCheckboxChange = async (event, hitman) => {
        const isChecked = event.target.checked;

        const url = `http://0.0.0.0:8000/api/hitmen/${hitmanId}/`;
        const updatedHitman = { in_charge_of: isChecked ? [hitmanId, ...hitman.in_charge_of] : hitman.in_charge_of.filter(id => id !== hitmanId) };

        try {
            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Token " + authToken,
                },
                body: JSON.stringify(updatedHitman),
            });

            if (response.ok) {
                handleHitmen(authToken);
            } else {
                const errorData = await response.json();
                const errorMessage = errorData?.non_field_errors[0] || "Unknown error occurred";
                setError(errorMessage);
            }
        } catch (error) {
            console.error(error);
            setError("An error occurred. Please try again.");
        }
    };

    // TODO: Create a button to add a new user
    const handleAddUser = async (user) => {
        const url = `http://0.0.0.0:8000/api/hitmen/${hitmanId}/`;

        const updatedHitman = { in_charge_of: [...user.in_charge_of, hitmanId] };

        try {
            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Token " + authToken,
                },
                body: JSON.stringify(updatedHitman),
            });

            if (response.ok) {
                handleHitmen(authToken);
            } else {
                const errorData = await response.json();
                const errorMessage = errorData?.non_field_errors[0] || "Unknown error occurred";
                setError(errorMessage);
            }
        } catch (error) {
            console.error(error);
            setError("An error occurred. Please try again.");
        }
    };

    useEffect(() => {
        const localAuthToken = localStorage.getItem("authToken")
        if (localAuthToken) {
            setAuthToken(localAuthToken)
        }

        if (authToken) {
            handleHitmen(authToken)
        }
    }, [authToken])

    useEffect(() => {
        setModalOpen(isOpen)
    }, [isOpen])

    useEffect(() => {
        handleHitmen(authToken)
    }, [hitmanId])


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
                        <div className="relative max-w-5xl w-full bg-white shadow-xl rounded-lg p-4 sm:p-6">
                            <div className="overflow-x-auto lg:overflow-x-hidden max-h-[20rem] mt-8">
                                {hitmen.length > 0 ?
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
                                                    className="border-b border-gray-300 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                                >
                                                    Assigned?
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {hitmen.map((hitman, personIdx) => (
                                                <tr key={hitman.email}>
                                                    <td
                                                        className={classNames(
                                                            "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8"
                                                        )}
                                                    >
                                                        {hitman.name}
                                                    </td>
                                                    <td
                                                        className={classNames(
                                                            "hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell"
                                                        )}
                                                    >
                                                        {hitman.email}
                                                    </td>
                                                    <td
                                                        className={classNames(
                                                            "hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 lg:table-cell"
                                                        )}
                                                    >
                                                        {hitman.description}
                                                    </td>
                                                    <td className={classNames("whitespace-nowrap px-3 py-4 text-sm text-gray-500")}>
                                                        {hitman.is_active ? "Active" : "Inactive"}
                                                    </td>

                                                    {hitman.is_active ? (
                                                        <td className={classNames("relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium")}>
                                                            <input
                                                                type="checkbox"
                                                                // checked={hitman.in_charge_of.includes(hitmanId)}
                                                                checked={true}
                                                                onChange={(event) => handleCheckboxChange(event, hitman)}
                                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                            />
                                                        </td>
                                                    ) : (
                                                        <></>
                                                    )}

                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    : <EmptyState label="hitmen" />}

                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
