import { useMemo, useState } from "react"
import { Check, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface SearchableSelectOption {
  value: string
  label: string
  keywords?: string[]
}

interface SearchableSelectProps {
  value?: string
  options: SearchableSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  onValueChange: (value: string) => void
}

export function SearchableSelect({
  value,
  options,
  placeholder = "请选择",
  searchPlaceholder = "搜索...",
  emptyText = "没有匹配项",
  disabled = false,
  onValueChange,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState("")

  const selectedOption = options.find((option) => option.value === value)
  const filteredOptions = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    if (!normalizedKeyword) {
      return options
    }

    return options.filter((option) => {
      const haystack = [option.label, option.value, ...(option.keywords || [])]
        .join(" ")
        .toLowerCase()
      return haystack.includes(normalizedKeyword)
    })
  }, [keyword, options])

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setKeyword("")
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="h-9 w-full justify-between px-3 font-normal"
        >
          <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1">
        <div className="border-b p-1">
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8"
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                  option.value === value && "bg-accent text-accent-foreground",
                )}
                onClick={() => {
                  onValueChange(option.value)
                  setOpen(false)
                  setKeyword("")
                }}
              >
                <span className="truncate">{option.label}</span>
                <Check className={cn("size-4 shrink-0", option.value === value ? "opacity-100" : "opacity-0")} />
              </button>
            ))
          ) : (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              {emptyText}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
