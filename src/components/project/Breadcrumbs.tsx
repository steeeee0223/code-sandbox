import * as React from "react";
import { Breadcrumbs as MuiBreadcrumbs, Chip } from "@mui/material";
import { styled, emphasize } from "@mui/material/styles";

function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.preventDefault();
    console.info("You clicked a breadcrumb.");
}

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor =
        theme.palette.mode === "light"
            ? theme.palette.grey[100]
            : theme.palette.grey[800];
    return {
        backgroundColor,
        height: theme.spacing(3),
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightRegular,
        "&:hover, &:focus": {
            backgroundColor: emphasize(backgroundColor, 0.06),
        },
        "&:active": {
            boxShadow: theme.shadows[1],
            backgroundColor: emphasize(backgroundColor, 0.12),
        },
    };
}) as typeof Chip;

interface BreadcrumbsProps {
    path: string[];
}

export default function Breadcrumbs({ path }: BreadcrumbsProps) {
    return (
        <div role="presentation" onClick={handleClick}>
            <MuiBreadcrumbs
                maxItems={3}
                aria-label="breadcrumb"
                sx={{ marginBottom: 2, fontSize: "small" }}
            >
                {path.map((name, index) => (
                    <StyledBreadcrumb
                        key={index}
                        component="a"
                        label={name}
                        href="#"
                    />
                ))}
            </MuiBreadcrumbs>
        </div>
    );
}