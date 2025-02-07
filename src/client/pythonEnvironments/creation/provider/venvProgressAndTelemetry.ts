// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CreateEnv } from '../../../common/utils/localize';
import { sendTelemetryEvent } from '../../../telemetry';
import { EventName } from '../../../telemetry/constants';
import { CreateEnvironmentProgress } from '../types';

export const VENV_CREATED_MARKER = 'CREATED_VENV:';
export const VENV_EXISTING_MARKER = 'EXISTING_VENV:';
export const INSTALLING_REQUIREMENTS = 'VENV_INSTALLING_REQUIREMENTS:';
export const INSTALLING_PYPROJECT = 'VENV_INSTALLING_PYPROJECT:';
export const PIP_NOT_INSTALLED_MARKER = 'CREATE_VENV.PIP_NOT_FOUND';
export const VENV_NOT_INSTALLED_MARKER = 'CREATE_VENV.VENV_NOT_FOUND';
export const INSTALL_REQUIREMENTS_FAILED_MARKER = 'CREATE_VENV.PIP_FAILED_INSTALL_REQUIREMENTS';
export const INSTALL_PYPROJECT_FAILED_MARKER = 'CREATE_VENV.PIP_FAILED_INSTALL_PYPROJECT';
export const CREATE_VENV_FAILED_MARKER = 'CREATE_VENV.VENV_FAILED_CREATION';
export const VENV_ALREADY_EXISTS_MARKER = 'CREATE_VENV.VENV_ALREADY_EXISTS';
export const INSTALLED_REQUIREMENTS_MARKER = 'CREATE_VENV.PIP_INSTALLED_REQUIREMENTS';
export const INSTALLED_PYPROJECT_MARKER = 'CREATE_VENV.PIP_INSTALLED_PYPROJECT';
export const UPGRADE_PIP_FAILED_MARKER = 'CREATE_VENV.UPGRADE_PIP_FAILED';
export const UPGRADING_PIP_MARKER = 'CREATE_VENV.UPGRADING_PIP';
export const UPGRADED_PIP_MARKER = 'CREATE_VENV.UPGRADED_PIP';

export class VenvProgressAndTelemetry {
    private venvCreatedReported = false;

    private venvOrPipMissingReported = false;

    private venvUpgradingPipReported = false;

    private venvUpgradedPipReported = false;

    private venvFailedReported = false;

    private venvInstallingPackagesReported = false;

    private venvInstallingPackagesFailedReported = false;

    private venvInstalledPackagesReported = false;

    private lastError: string | undefined = undefined;

    constructor(private readonly progress: CreateEnvironmentProgress) {}

    public process(output: string): void {
        if (!this.venvCreatedReported && output.includes(VENV_CREATED_MARKER)) {
            this.venvCreatedReported = true;
            this.progress.report({
                message: CreateEnv.Venv.created,
            });
            sendTelemetryEvent(EventName.ENVIRONMENT_CREATED, undefined, {
                environmentType: 'venv',
                reason: 'created',
            });
        } else if (!this.venvCreatedReported && output.includes(VENV_EXISTING_MARKER)) {
            this.venvCreatedReported = true;
            this.progress.report({
                message: CreateEnv.Venv.created,
            });
            sendTelemetryEvent(EventName.ENVIRONMENT_CREATED, undefined, {
                environmentType: 'venv',
                reason: 'existing',
            });
        } else if (!this.venvOrPipMissingReported && output.includes(VENV_NOT_INSTALLED_MARKER)) {
            this.venvOrPipMissingReported = true;
            sendTelemetryEvent(EventName.ENVIRONMENT_FAILED, undefined, {
                environmentType: 'venv',
                reason: 'noVenv',
            });
            this.lastError = VENV_NOT_INSTALLED_MARKER;
        } else if (!this.venvOrPipMissingReported && output.includes(PIP_NOT_INSTALLED_MARKER)) {
            this.venvOrPipMissingReported = true;
            sendTelemetryEvent(EventName.ENVIRONMENT_FAILED, undefined, {
                environmentType: 'venv',
                reason: 'noPip',
            });
            this.lastError = PIP_NOT_INSTALLED_MARKER;
        } else if (!this.venvUpgradingPipReported && output.includes(UPGRADING_PIP_MARKER)) {
            this.venvUpgradingPipReported = true;
            this.progress.report({
                message: CreateEnv.Venv.upgradingPip,
            });
            sendTelemetryEvent(EventName.ENVIRONMENT_INSTALLING_PACKAGES, undefined, {
                environmentType: 'venv',
                using: 'pipUpgrade',
            });
        } else if (!this.venvFailedReported && output.includes(CREATE_VENV_FAILED_MARKER)) {
            this.venvFailedReported = true;
            sendTelemetryEvent(EventName.ENVIRONMENT_FAILED, undefined, {
                environmentType: 'venv',
                reason: 'other',
            });
            this.lastError = CREATE_VENV_FAILED_MARKER;
        } else if (!this.venvInstallingPackagesReported && output.includes(INSTALLING_REQUIREMENTS)) {
            this.venvInstallingPackagesReported = true;
            this.progress.report({
                message: CreateEnv.Venv.installingPackages,
            });
            sendTelemetryEvent(EventName.ENVIRONMENT_INSTALLING_PACKAGES, undefined, {
                environmentType: 'venv',
                using: 'requirements.txt',
            });
        } else if (!this.venvInstallingPackagesReported && output.includes(INSTALLING_PYPROJECT)) {
            this.venvInstallingPackagesReported = true;
            this.progress.report({
                message: CreateEnv.Venv.installingPackages,
            });
            sendTelemetryEvent(EventName.ENVIRONMENT_INSTALLING_PACKAGES, undefined, {
                environmentType: 'venv',
                using: 'pyproject.toml',
            });
        } else if (!this.venvInstallingPackagesFailedReported && output.includes(UPGRADE_PIP_FAILED_MARKER)) {
            this.venvInstallingPackagesFailedReported = true;
            sendTelemetryEvent(EventName.ENVIRONMENT_INSTALLING_PACKAGES_FAILED, undefined, {
                environmentType: 'venv',
                using: 'pipUpgrade',
            });
            this.lastError = UPGRADE_PIP_FAILED_MARKER;
        } else if (!this.venvInstallingPackagesFailedReported && output.includes(INSTALL_REQUIREMENTS_FAILED_MARKER)) {
            this.venvInstallingPackagesFailedReported = true;
            sendTelemetryEvent(EventName.ENVIRONMENT_INSTALLING_PACKAGES_FAILED, undefined, {
                environmentType: 'venv',
                using: 'requirements.txt',
            });
            this.lastError = INSTALL_REQUIREMENTS_FAILED_MARKER;
        } else if (!this.venvInstallingPackagesFailedReported && output.includes(INSTALL_PYPROJECT_FAILED_MARKER)) {
            this.venvInstallingPackagesFailedReported = true;
            sendTelemetryEvent(EventName.ENVIRONMENT_INSTALLING_PACKAGES_FAILED, undefined, {
                environmentType: 'venv',
                using: 'pyproject.toml',
            });
            this.lastError = INSTALL_PYPROJECT_FAILED_MARKER;
        } else if (!this.venvUpgradedPipReported && output.includes(UPGRADED_PIP_MARKER)) {
            this.venvUpgradedPipReported = true;
            sendTelemetryEvent(EventName.ENVIRONMENT_INSTALLED_PACKAGES, undefined, {
                environmentType: 'venv',
                using: 'pipUpgrade',
            });
        } else if (!this.venvInstalledPackagesReported && output.includes(INSTALLED_REQUIREMENTS_MARKER)) {
            this.venvInstalledPackagesReported = true;
            sendTelemetryEvent(EventName.ENVIRONMENT_INSTALLED_PACKAGES, undefined, {
                environmentType: 'venv',
                using: 'requirements.txt',
            });
        } else if (!this.venvInstalledPackagesReported && output.includes(INSTALLED_PYPROJECT_MARKER)) {
            this.venvInstalledPackagesReported = true;
            sendTelemetryEvent(EventName.ENVIRONMENT_INSTALLED_PACKAGES, undefined, {
                environmentType: 'venv',
                using: 'pyproject.toml',
            });
        }
    }

    public getLastError(): string | undefined {
        return this.lastError;
    }
}
