import {
    PayloadAction,
    createEntityAdapter,
    createSlice,
} from "@reduxjs/toolkit";

import { CopiedItems, DirectoryItem, SelectedItem } from "./directory";
import {
    createFileAsync,
    createFolderAsync,
    deleteDirectoryAsync,
    getDirectoryAsync,
    renameDirectoryItemAsync,
    updateFileAsync,
    uploadFileAsync,
} from "./directory.thunk";

export const directoryAdapter = createEntityAdapter<DirectoryItem>({
    selectId: (item) => item.itemId,
    sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const rootItem: SelectedItem = {
    item: { id: "root", name: "root", isFolder: true },
    path: { id: [], name: [] },
};

const initialState = directoryAdapter.getInitialState<{
    isLoading: boolean;
    currentItem: SelectedItem;
    copiedItems: CopiedItems | null;
}>({
    isLoading: true,
    currentItem: rootItem,
    copiedItems: null,
});

const directorySlice = createSlice({
    name: "directory",
    initialState,
    reducers: {
        selectItem: (state, { payload }: PayloadAction<SelectedItem>) => {
            state.currentItem = payload;
        },
        copyItems: (state, { payload }: PayloadAction<CopiedItems | null>) => {
            state.copiedItems = payload;
        },
    },
    extraReducers(builder) {
        builder.addCase(
            createFolderAsync.fulfilled ||
                createFileAsync.fulfilled ||
                uploadFileAsync.fulfilled,
            directoryAdapter.addOne
        );
        builder.addCase(
            getDirectoryAsync.pending ||
                createFolderAsync.rejected ||
                createFileAsync.rejected ||
                uploadFileAsync.rejected,
            (state) => {
                state.isLoading = true;
            }
        );
        builder.addCase(
            getDirectoryAsync.fulfilled,
            (state, { payload }: PayloadAction<DirectoryItem[]>) => {
                directoryAdapter.setAll(state, payload);
                state.isLoading = false;
            }
        );
        builder.addCase(
            deleteDirectoryAsync.fulfilled,
            (state, { payload }) => {
                directoryAdapter.removeMany(state, payload);
                state.currentItem = rootItem;
            }
        );
        builder.addCase(
            renameDirectoryItemAsync.fulfilled || updateFileAsync.fulfilled,
            directoryAdapter.updateOne
        );
    },
});

export type DirectoryState = typeof initialState;
export const directorySelector = directoryAdapter.getSelectors(
    (state: DirectoryState) => state
);

export const { selectItem, copyItems } = directorySlice.actions;
export default directorySlice.reducer;
