/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { cloneElement } from 'react';
import useObservable from 'react-use/lib/useObservable';
import AutoIcon from '@material-ui/icons/BrightnessAuto';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import {
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Tooltip,
} from '@material-ui/core';
import { appThemeApiRef, useApi } from '@backstage/core-plugin-api';

type ThemeIconProps = {
  icon: JSX.Element | undefined;
  selected: boolean | undefined;
};

const ThemeIcon = ({ icon, selected }: ThemeIconProps) =>
  icon
    ? cloneElement(icon, {
        color: selected ? 'primary' : undefined,
      })
    : null;

type TooltipToggleButtonProps = {
  children: JSX.Element;
  title: string;
  value: string;
};

const useStyles = makeStyles(theme => ({
  listItemSecondaryAction: {
    position: 'relative',
    transform: 'unset',
    top: 'auto',
    right: 'auto',
    paddingLeft: 16,
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
    },
  },
}));

// ToggleButtonGroup uses React.children.map instead of context
// so wrapping with Tooltip breaks ToggleButton functionality.
const TooltipToggleButton = ({
  children,
  title,
  value,
  ...props
}: TooltipToggleButtonProps) => (
  <Tooltip placement="top" arrow title={title}>
    <ToggleButton value={value} {...props}>
      {children}
    </ToggleButton>
  </Tooltip>
);

/** @public */
export const UserSettingsThemeToggle = () => {
  const classes = useStyles();
  const appThemeApi = useApi(appThemeApiRef);
  const themeId = useObservable(
    appThemeApi.activeThemeId$(),
    appThemeApi.getActiveThemeId(),
  );

  const themes = appThemeApi.getInstalledThemes();

  const handleSetTheme = (newThemeId: string | undefined) => {
    if (themes.some(t => t.id === newThemeId)) {
      appThemeApi.setActiveThemeId(newThemeId);
    } else {
      appThemeApi.setActiveThemeId(undefined);
    }
  };

  return (
    <ListItem>
      <ListItemText primary="Theme" secondary="Change the theme mode" />
      <ListItemSecondaryAction className={classes.listItemSecondaryAction}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={themeId ?? 'auto'}
          onChange={(_event, newThemeId) => handleSetTheme(newThemeId)}
        >
          <Tooltip placement="top" arrow title="Select auto theme">
            <ToggleButton value="auto" selected={themeId === undefined}>
              Auto&nbsp;
              <AutoIcon color={themeId === undefined ? 'primary' : undefined} />
            </ToggleButton>
          </Tooltip>
          {themes.map(theme => (
            <TooltipToggleButton
              key={theme.id}
              title={`Select ${theme.title}`}
              value={theme.id}
            >
              <>
                {theme.title}&nbsp;
                <ThemeIcon icon={theme.icon} selected={theme.id === themeId} />
              </>
            </TooltipToggleButton>
          ))}
        </ToggleButtonGroup>
      </ListItemSecondaryAction>
    </ListItem>
  );
};
