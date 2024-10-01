import React, { Suspense } from "react";
import { baseColors } from "@/components/ui/ui-builder/internal/base-colors";
import {
  isTextLayer,
  Layer,
  PageLayer,
} from "@/components/ui/ui-builder/internal/store/component-store";
import { Markdown } from "@/components/ui/ui-builder/markdown";
import { ClickableWrapper } from "@/components/ui/ui-builder/internal/clickable-wrapper";
import { componentRegistry } from "@/components/ui/ui-builder/internal/store/component-store";
import { ErrorBoundary } from "react-error-boundary";

import { ErrorFallback } from "@/components/ui/ui-builder/internal/error-fallback";

export interface EditorConfig {
  zIndex: number;
  totalLayers: number;
  selectedLayer: Layer;
  onSelectElement: (layerId: string) => void;
  handleDuplicateLayer: () => void;
  handleDeleteLayer: () => void;
}

export const renderPage = (page: PageLayer, editorConfig?: EditorConfig) => {
  const { mode, colorTheme, style, ...rest } = page.props;

  console.log("page", { mode, colorTheme, style, ...rest });
  const colorData = colorTheme
    ? baseColors.find((color) => color.name === colorTheme)
    : undefined;

  let globalOverrides = colorData
    ? {
        backgroundColor: `hsl(${
          colorData.cssVars[mode as "light" | "dark"].background
        })`,
        color: `hsl(${colorData.cssVars[mode as "light" | "dark"].foreground})`,
        borderColor: `hsl(${
          colorData.cssVars[mode as "light" | "dark"].border
        })`,
      }
    : {};
  console.log("globalOverrides", globalOverrides);
  return (
    <div
      className="flex flex-col w-full overflow-y-visible relative"
      style={{
        ...style,
        ...globalOverrides,
      }}
      {...rest}
    >
      {page.children.map((child) => renderLayer(child, editorConfig))}
    </div>
  );
};

const renderLayer = (layer: Layer, editorConfig?: EditorConfig) => {
  if (isTextLayer(layer)) {
    const TextComponent = layer.textType === "markdown" ? Markdown : "span";
    console.log("text layer", layer);
    if (!editorConfig) {
      return (
        <ErrorSuspenseWrapper key={layer.id}>
          <TextComponent {...layer.props}>{layer.text}</TextComponent>
        </ErrorSuspenseWrapper>
      );
    } else {
      const {
        zIndex,
        totalLayers,
        selectedLayer,
        onSelectElement,
        handleDuplicateLayer,
        handleDeleteLayer,
      } = editorConfig;
      return (
        <ClickableWrapper
          key={layer.id}
          layer={layer}
          zIndex={zIndex}
          totalLayers={totalLayers}
          isSelected={layer.id === selectedLayer?.id}
          onSelectElement={onSelectElement}
          onDuplicateLayer={handleDuplicateLayer}
          onDeleteLayer={handleDeleteLayer}
        >
          <ErrorSuspenseWrapper key={layer.id}>
            <TextComponent {...layer.props}>{layer.text}</TextComponent>
          </ErrorSuspenseWrapper>
        </ClickableWrapper>
      );
    }
  }

  const { component: Component } =
    componentRegistry[layer.type as keyof typeof componentRegistry];
  if (!Component) return null;

  const childProps = { ...layer.props };
  if (layer.children && layer.children.length > 0) {
    childProps.children = layer.children.map((child) => {
      if (editorConfig) {
        return renderLayer(child, {
          ...editorConfig,
          zIndex: editorConfig.zIndex + 1,
        });
      } else {
        return renderLayer(child);
      }
    });
  }

  if (!editorConfig) {
    return (
      <ErrorSuspenseWrapper key={layer.id}>
        <Component {...(childProps as any)} />
      </ErrorSuspenseWrapper>
    );
  } else {
    const {
      zIndex,
      totalLayers,
      selectedLayer,
      onSelectElement,
      handleDuplicateLayer,
      handleDeleteLayer,
    } = editorConfig;
    return (
      <ClickableWrapper
        key={layer.id}
        layer={layer}
        zIndex={zIndex}
        totalLayers={totalLayers}
        isSelected={layer.id === selectedLayer?.id}
        onSelectElement={onSelectElement}
        onDuplicateLayer={handleDuplicateLayer}
        onDeleteLayer={handleDeleteLayer}
      >
        <ErrorSuspenseWrapper key={layer.id}>
          <Component {...(childProps as any)} />
        </ErrorSuspenseWrapper>
      </ClickableWrapper>
    );
  }
};

const ErrorSuspenseWrapper: React.FC<{
  key: string;
  children: React.ReactNode;
}> = ({ key, children }) => (
  <ErrorBoundary key={key} fallbackRender={ErrorFallback}>
    <Suspense key={key} fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  </ErrorBoundary>
);
