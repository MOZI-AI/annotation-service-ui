import React from "react";
import {
  TextField,
  Button,
  FormControlLabel,
  RadioGroup,
  Radio,
  Chip,
  InputAdornment
} from "@material-ui/core";
import { CloudUpload, Check, Close, KeyboardReturn } from "@material-ui/icons";
import Dropzone from "react-dropzone";
import classNames from "classnames";
import { checkDuplicate } from "../utils";
import fileSize from "filesize";

const InputMethods = {
  DIRECT_INPUT: "1",
  FILE_UPLOAD: "2"
};

export class GeneSelectionForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputMethod: InputMethods.DIRECT_INPUT,
      currentGeneName: "",
      validationErrors: {
        gene: null
      }
    };
    this.uploaderAttributes = {
      name: "geneList",
      multiple: false,
      beforeUpload: geneList => {
        this.props.onGeneListUploaded(geneList);
        return false;
      }
    };
    this.handleGeneAdded = this.handleGeneAdded.bind(this);
  }

  isValid() {
    let validationErrors = Object.assign({}, this.state.validationErrors);
    return Object.values(validationErrors).filter(v => v).length === 0;
  }

  handleGeneAdded() {
    if (this.state.currentGeneName && !this.state.validationErrors.gene) {
      this.props.onGeneAdded(this.state.currentGeneName);
      this.setState({ currentGeneName: "" });
    }
  }

  render() {
    const props = {
      name: "geneList",
      multiple: false,
      onDrop: files => {
        const file = files[0];
        this.props.onGeneListUploaded(file);
      }
    };

    return (
      <React.Fragment>
        <RadioGroup
          id="inputMethod"
          onChange={e => {
            this.setState({ inputMethod: e.target.value });
          }}
          style={{ display: "flex", flexDirection: "row" }}
          defaultValue={this.state.inputMethod}
        >
          <FormControlLabel
            value={InputMethods.DIRECT_INPUT}
            control={<Radio />}
            label="Input directly"
          />
          <FormControlLabel
            value={InputMethods.FILE_UPLOAD}
            control={<Radio />}
            label="Import from file"
          />
        </RadioGroup>
        {this.state.inputMethod === InputMethods.DIRECT_INPUT && (
          <TextField
            {...this.state.validationErrors.gene}
            style={{ width: "100%" }}
            id="directInputForm"
            label="Gene name"
            placeholder="Input gene name and hit enter"
            margin="dense"
            variant="outlined"
            name="gene"
            value={this.state.currentGeneName}
            onChange={e => {
              let validationErrors = Object.assign(
                {},
                this.state.validationErrors
              );
              validationErrors.gene = checkDuplicate(
                e.target.value.trim(),
                this.props.genes
              );
              this.setState({
                validationErrors: validationErrors,
                currentGeneName: e.target.value
              });
            }}
            onKeyDown={e => (e.key === "Enter" ? this.handleGeneAdded() : null)}
            InputProps={{
              endAdornment: (
                <InputAdornment
                  style={{ cursor: "pointer" }}
                  position="start"
                  onClick={e => this.handleGeneAdded()}
                >
                  <KeyboardReturn />
                </InputAdornment>
              )
            }}
          />
        )}

        {this.state.inputMethod === InputMethods.FILE_UPLOAD && (
          <React.Fragment>
            <Dropzone {...props} style={{ marginBottom: "15px" }}>
              {({ getRootProps, getInputProps, isDragActive }) => {
                return (
                  <div
                    {...getRootProps()}
                    className={classNames("dropzone", {
                      "dropzone--isActive": isDragActive
                    })}
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      border: "dashed 1px #90D4FF"
                    }}
                  >
                    <input {...getInputProps()} />
                    {this.props.uploadedFile ? (
                      <Check style={{ fontSize: "48px", color: "#54C21F" }} />
                    ) : (
                      <CloudUpload style={{ fontSize: "48px" }} />
                    )}
                    {isDragActive ? (
                      <p>Drop file here...</p>
                    ) : (
                      <p>
                        Please make sure the file is a plain text file
                        containing a gene name per line.
                      </p>
                    )}
                  </div>
                );
              }}
            </Dropzone>

            {this.props.geneList && this.props.genes.length ? (
              <div
                className="fileDetails"
                style={{
                  borderRadius: 0,
                  position: "relative",
                  bottom: "5px",
                  border: "solid 1px #90D4FF",
                  borderTop: "none",
                  padding: "15px",
                  backgroundColor: "#e1f4ff"
                }}
              >
                {this.props.geneList.name +
                  " ( " +
                  fileSize(this.props.geneList.size) +
                  " )"}
              </div>
            ) : null}
          </React.Fragment>
        )}

        <div style={{ marginTop: "10px" }}>
          <h4 style={{ color: "#000", marginBottom: "5px" }}>
            Selected genes:
            {this.props.genes.length ? (
              <Button
                id="submit"
                variant="outlined"
                onClick={e => this.props.onAllGenesRemoved()}
                color="secondary"
                style={{ marginLeft: "15px" }}
              >
                <Close />
                Remove all
              </Button>
            ) : null}
          </h4>
          {!this.props.genes.length ? (
            <div
              style={{
                padding: "15px",
                backgroundColor: "#FFFBE5",
                border: "solid 1px #ffe7bc",
                borderRadius: "3px"
              }}
              id="noGenesAlert"
            >
              The genes you input appear here. You may input gene names directly
              or import them from file.
            </div>
          ) : null}

          {this.props.genes.length
            ? this.props.genes.map(gene => (
                <Chip
                  style={{ marginRight: "5px", marginBottom: "5px" }}
                  label={<b>{gene}</b>}
                  onDelete={() => this.props.onGeneRemoved(gene)}
                  color="primary"
                  key={gene}
                />
              ))
            : null}
        </div>
      </React.Fragment>
    );
  }
}
