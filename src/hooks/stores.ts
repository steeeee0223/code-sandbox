import { useEffect } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { shallowEqual } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/config/firebase";
import store from "@/stores/store";
import { setUser } from "@/stores/auth";
import {
    directorySelector,
    getChildren,
    getFullPath,
    getItem,
    getRecursiveItemIds,
    getSelectedItem,
} from "@/stores/directory";
import { getProjectsAsync, projectSelector } from "@/stores/project";

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useDirectory = (itemId: string) => {
    const { directoryState, projectId } = useAppSelector(
        (state) => ({
            directoryState: state.directory,
            projectId: state.project.currentProject?.id,
        }),
        shallowEqual
    );
    const directory = directorySelector.selectAll(directoryState);
    const item = getItem(directory, itemId);
    const firstLayerChildren = getChildren(directory, itemId);
    const children = getRecursiveItemIds(directory, itemId);
    const selectedItem = getSelectedItem(directory, itemId);
    const path = getFullPath(directory, itemId);

    const isFolderPresent = (folderName: string): boolean => {
        return !!directory.find(
            ({ isFolder, parent, name }) =>
                isFolder && parent === itemId && name === folderName
        );
    };
    const isFilePresent = (fileName: string): boolean => {
        return !!directory.find(
            ({ isFolder, parent, name }) =>
                !isFolder && parent === itemId && name === fileName
        );
    };

    return {
        projectId,
        directory,
        item,
        firstLayerChildren,
        children,
        selectedItem,
        path,
        isFolderPresent,
        isFilePresent,
    };
};

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, isLoggedIn } = useAppSelector(
        (state) => ({
            user: state.auth.user,
            isLoggedIn: state.auth.isLoggedIn,
        }),
        shallowEqual
    );

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) =>
            dispatch(setUser(currentUser))
        );

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) dispatch(getProjectsAsync(user.uid));
    }, [user]);

    return { user, isLoggedIn };
};

export const useProjects = () => {
    const { user } = useAuth();
    const { projectState, isLoading } = useAppSelector(
        (state) => ({
            projectState: state.project,
            isLoading: state.project.isLoading,
        }),
        shallowEqual
    );
    const projects = projectSelector.selectAll(projectState);
    const projectIds = projectSelector.selectIds(projectState) as string[];
    const isProjectPresent = (projectName: string): boolean => {
        return !!projects.find(({ name }) => projectName === name);
    };
    const isProjectMatch = (projectName: string, id: string): boolean => {
        return !!projects.find(
            ({ name, projectId }) => name === projectName && projectId === id
        );
    };

    return {
        user,
        projects,
        projectIds,
        isLoading,
        isProjectPresent,
        isProjectMatch,
    };
};
